const { response, query } = require('express');
const { Pool } = require('pg')
const pool = new Pool({
    user: '***',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_password',
    port: 5432,
    max:20,
    idleTimeoutMillis:30000,
});

const handleCreateCustomer = async(args) => {
    const client = await pool.connect();
    try {
        const {first_name,last_name,city,company} = args.data;

        const {rows:customerData} = await client.query(
            `INSERT INTO customer(first_name,last_name,city,company) VALUES($1,$2,$3,$4) RETURNING *`,
            [first_name,last_name,city,company]
        );
            console.log("customerData>>>>>>",customerData[0]);
            let responseData = {
                status:200,
                message:"customer added successfully",
                data:customerData[0],
            }
        return responseData
    } catch (error) {
        client.release();
        return {status:400,mesage:"internal Server Error",data:null}
    }
}

const handleGetAllCustomer = async(args) => {
    const client = await pool.connect();
    try {
        const {search_text,skip,take} = args.data;

        let params = [skip,take]
        let searchQuery = '';
        if(search_text){
            params.push(`%${search_text}%`);
            searchQuery +=` WHERE first_name ILIKE $3
                                     OR last_name ILIKE $3
                                     OR city ILIKE $3`

        }

        const query = `SELECT * FROM customer${searchQuery} OFFSET $1 LIMIT $2`;    
        
        const {rows:customerData} = await client.query(query,params);

        if(!customerData.length){
            return {status:404,message:"No Data Found",data:null}
        }

        return {status:200,message:"success",data:customerData}
    } catch (error) {
        client.release();
        return {status:400,mesage:"internal Server Error",data:null}
    }
}

const handleGetCustomerById = async(args) => {
    const client = await pool.connect();
    try {
        const {customer_id} = args.data;

        const {rows:customerData} = await client.query(
                `select * from customer where customer_id = $1`,[customer_id]
        );

        if(!customerData.length){
            return {status:404,message:"No Data Found",data:null}
        }

        return {status:200,message:"success",data:customerData[0]}
    } catch (error) {
        client.release();
        return {status:400,mesage:"internal Server Error",data:null}
    }
}
const handleCreateMultipleCustomer = async(args) => {
    const client = await pool.connect();
    try {
        const {customers} = args.data;

        let insertedCustomers = [];

        await client.query('BEGIN');

        for (const customer of customers) {
            const { rows } = await client.query(
                `INSERT INTO customer (first_name, last_name, city, company) VALUES ($1, $2, $3, $4) RETURNING *`,
                [customer.first_name, customer.last_name, customer.city, customer.company]
            );
            insertedCustomers.push(...rows);
        }

        await client.query('COMMIT');

        return {status:200,message:"success",data:insertedCustomers}
    } catch (error) {
        client.release();
        return {status:400,mesage:"internal Server Error",data:null}
    }
}

const handleGetCityAndCustomersCount = async (args) => {
    const client = await pool.connect();
    try {
        const {skip,take} = args.data

        const {rows:cityAndCustomerData} = await client.query(
            `SELECT city, COUNT(*) AS customers FROM customer GROUP BY city OFFSET $1 LIMIT $2;`,
            [skip,take]
        );

        if(!cityAndCustomerData.length){
            return {status:404,mesage:"No Data Found!",data:null}
        }

        return {status:200,message:"success",data:cityAndCustomerData}

    } catch (error) {
        client.release();
        return {status:400,mesage:"internal Server Error",data:null}
    }
}
module.exports = {
    handleCreateCustomer,
    handleGetAllCustomer,
    handleGetCustomerById,
    handleCreateMultipleCustomer,
    handleGetCityAndCustomersCount
}