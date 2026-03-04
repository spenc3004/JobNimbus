let table;
let statuses = []
let complete = []
function toUnix(date) {
    return Math.floor(new Date(date).getTime() / 1000);
}
function fromUnix(unix) {
    return new Date(unix * 1000).toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', () => {
    // #region page loaded
    fetch('/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(async data => {
            const flows = data.workflows

            for (typ in flows) {
                if (flows[typ].object_type === 'job') {
                    statuses = flows[typ].status
                }
            }
            console.log(statuses)


            statuses.forEach(status => {
                if (status.stage === 'Completed') {
                    complete.push(status.id)
                }
            })
            console.log(complete)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        }


        )

    //initialize table
    table = new Tabulator('#table',
        {
            pagination: 'local',
            paginationSize: 15,
            columns: [
                { title: 'Job ID', field: 'jnid' },
                { title: 'Job Status', field: 'status_name' },
                { title: 'Completed Date', field: 'completedDate' },
                { title: 'Job Location Street', field: 'locationStreet' },
                { title: 'Job Location City', field: 'locationCity' },
                { title: 'Job Location State', field: 'locationState' },
                { title: 'Job Location Zip', field: 'locationZip' },
                { title: 'Total Cost', field: 'cost' },
                { title: 'Customer ID', field: 'customerId' },
                { title: 'Customer Name', field: 'customerName' },
                { title: 'Customer Type', field: 'customerType' },
                { title: 'Customer Street', field: 'customerStreet' },
                { title: 'Customer City', field: 'customerCity' },
                { title: 'Customer State', field: 'customerState' },
                { title: 'Customer Zip', field: 'customerZip' },
                { title: 'Do Not Mail', field: 'doNotMail' }




            ] //create columns from data field names
        });
});


document.getElementById('fetch-btn').addEventListener('click', () => {
    // #region user clicks Get button

    const startDate = toUnix(document.getElementById('start-date').value);
    const endDate = toUnix(document.getElementById('end-date').value);



    const data = { startDate, endDate, complete };

    // Show loading spinner
    document.getElementById('loading-spinner').style.display = 'flex';



    // Fetch job data from jobs endpoint
    fetch('/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(async jobsData => {
            const jobsArray = jobsData.data
            //const invoiceIds = jobsArray.map(job => job.invoiceId) // Get all job ids from the jobs array
            //const customerIds = jobsArray.map(job => job.customerId) // Get all customer ids from the jobs array
            console.log(jobsArray)
            //console.log(invoiceIds)
            //console.log(customerIds)

            const jobs = jobsArray.map(job => {
                job.locationStreet = `${job.address_line1} ${job.address_line2}`
                job.locationCity = job.city
                job.locationState = job.state_text
                job.locationZip = job.zip
                job.cost = job.approved_invoice_total
                job.customerId = job.primary.id
                job.completedDate = fromUnix(job.date_end)
                return job;
            });

            const customerIds = [...new Set(jobs.map(job => job.customerId))]; // Get unique customer ids from the jobs array

            const customerResponse = await fetch('/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customerIds })
            });
            const customerData = await customerResponse.json();
            const customerArray = customerData.data
            console.log(customerArray)
            const customerMap = new Map()
            customerArray.forEach(customer => {
                customerMap.set(customer.jnid, customer)
            })

            console.log(customerMap)

            const jobsWithCustomerData = jobs.map(job => {
                const customer = customerMap.get(job.customerId)
                if (customer) {
                    job.customerName = `${customer.first_name} ${customer.last_name}`
                    job.customerType = customer.record_type_name
                    job.customerStreet = `${customer.address_line1} ${customer.address_line2}`
                    job.customerCity = customer.city
                    job.customerState = customer.state_text
                    job.customerZip = customer.zip
                }
                return job;
            })





            // Put data into table
            table.setData(jobsWithCustomerData);

            // Hide loading spinner
            document.getElementById('loading-spinner').style.display = 'none';

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            // Hide loading spinner
            document.getElementById('loading-spinner').style.display = 'none';
        });
    // #endregion
});