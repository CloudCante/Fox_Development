//functions to call the fixtures, health, and usage APIs
//connect to the backend routes defined in server.js

import axios from 'axios';
const API_BASE_URL = '/api/fixtures'; // Base URL

//**********************************************************
// GET Functions
//**********************************************************

//GET all fixtures
export const getAllFixtures = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all fixtures:', error);
        throw error;
    }
};

//GET fixture by ID
export const getFixtureById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching fixture with id ${id}:`, error);
        throw error;
    }
};

//GET all health
export const getAllHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    }catch (error) {
        console.error('Error fetching all health records:', error);
        throw error;
    }
};


//GET health by id
export const getHealthById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching health with id ${id}:`, error);
        throw error;
    }
};

//GET all usage
export const getAllUsage = async () => {
    try {const response = await axios.get(`${API_BASE_URL}/usage`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all usage records:', error);
        throw error;
    }
};

//GET usage by id
export const getUsageById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/usage/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching usage with id ${id}:`, error);
        throw error;
    }
};

//**********************************************************
// POST Functions
//**********************************************************

//POST new fixture
//format: {tester_type, fixture_name, rack, fixture_sn, test_type, ip_address, mac_address, creator}
export const postFixture = async (fixturePostData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/`, fixturePostData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating new fixture:', error);
        throw error;
    }
};

//POST new health record
//format: {fixture_id, status, comments, creator}
export const postHealth = async (healthPostData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/health`, healthPostData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating new health record:', error);
        throw error;
    }
};

//POST new usage record
//format: {fixture_id, user, action, comments, creator}
export const postUsage = async (usagePostData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/usage`, usagePostData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating new usage record:', error);
        throw error;
    }
};

//**********************************************************
// PATCH Functions
//**********************************************************

//PATCH update fixture by ID
export const updateFixture = async (id, fixtureUpdateData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}`, fixtureUpdateData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating fixture with id ${id}:`, error);
        throw error;
    }
};

//PATCH update health by ID 
export const updateHealth = async (id, healthUpdateData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/health/${id}`, healthUpdateData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating health with id ${id}:`, error);
        throw error;
    }
};

//PATCH update usage by ID
export const updateUsage = async (id, usageUpdateData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/usage/${id}`, usageUpdateData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating usage with id ${id}:`, error);
        throw error;
    }
};

//**********************************************************
// DELETE Functions
//**********************************************************

//DELETE fixture by ID
export const deleteFixture = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting fixture with id ${id}:`, error);
        throw error;
    }
};
//DELETE health by ID
export const deleteHealth = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/health/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting health with id ${id}:`, error);
        throw error;
    }
};
//DELETE usage by ID
export const deleteUsage = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/usage/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting usage with id ${id}:`, error);
        throw error;
    }
};