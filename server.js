const express = require('express');
const app = express();
const PORT = 3001;
require('dotenv').config();
const appKey = process.env.APP_KEY;
const cookieParser = require('cookie-parser');


app.use(express.static('public'));
app.use(express.json()); //middleware to pull json out of the request
app.use(cookieParser());

app.post('/status', async (req, res) => {
    // #region POST /statuses
    if (!appKey) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const response = await fetch('https://app.jobnimbus.com/api1/account/settings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${appKey}`,
            }
        });

        if (response.status === 401) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching statuses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    // #endregion
});

app.post('/jobs', async (req, res) => {
    const { startDate, endDate, complete: statuses } = req.body;

    if (!appKey) return res.status(401).json({ message: 'Unauthorized' });

    const pageSize = 500;
    let allJobs = [];

    try {
        for (const statusId of statuses) {
            let offset = 0;

            while (true) {
                const url =
                    `https://app.jobnimbus.com/api1/jobs?size=${pageSize}` +
                    `&filter=${encodeURIComponent(JSON.stringify({
                        must: [
                            { term: { status: statusId } },
                            { range: { date_end: { gte: startDate, lte: endDate } } }
                        ]
                    }))}` +
                    `&from=${offset}`;

                const resp = await fetch(url, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${appKey}` }
                });

                if (resp.status === 401) throw new Error('Unauthorized');

                const jobsData = await resp.json();
                const results = jobsData.results ?? [];

                allJobs.push(...results);

                if (results.length < pageSize) break; // last page
                offset += pageSize;
            }
        }

        return res.json({ data: allJobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        if (error.message === 'Unauthorized') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/customers', async (req, res) => {
    const { customerIds } = req.body;

    if (!appKey) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const allCustomers = [];

        for (const custId of customerIds) {
            const url = `https://app.jobnimbus.com/api1/contacts/${custId}`;

            const resp = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${appKey}` },
            });

            if (resp.status === 401) throw new Error('Unauthorized');
            if (!resp.ok) {
                // optional: skip not-found / no-access instead of failing whole request
                console.warn(`Customer fetch failed for ${custId}: ${resp.status}`);
                continue;
            }

            const customer = await resp.json(); // <-- single object
            allCustomers.push(customer);
        }

        return res.json({ data: allCustomers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        if (error.message === 'Unauthorized') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

