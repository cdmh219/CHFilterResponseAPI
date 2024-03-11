const API_KEY = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
const PORT = 3000;

const express = require('express');
const request = require('request');

const app = express();

const qFilterToCondition = (q, filter) => {
    switch(filter.condition){
        case 'equals':
            return q.value === filter.value;
        case 'does_not_equal':
            return q.value !== filter.value;
        case 'greater_than':
            return q.value > filter.value;
        case 'less_than':
            return q.value < filter.value;
        default: return true;
    }
};

const meetsConditions = (questions, filters) => {
    let qFilter;

    for(let i = 0; i < questions.length; i++){
        qFilter = filters.find(filter => filter.id === questions[i].id);
        if (qFilterToCondition(questions[i], qFilter) === false) {
            return false;
        }
    }
    return true;
};

app.get('/:formId/filteredResponses', (req, res) => {
    const parsedFilters =  req.query.filters ? JSON.parse(req.query.filters):[];
    const limit = req.query.limit ? req.query.limit: 150;

    request(`https://api.fillout.com/v1/api/forms/${req.params.formId}/submissions`, {json: true, headers: {Authorization: `Bearer ${API_KEY}`}}, (error, response, body) => {
        const filteredResponses = body.responses.filter(filteredResponse => {
            return meetsConditions(filteredResponse.questions, parsedFilters);
        });
 
        res.json({responses: filteredResponses, totalResponses: filteredResponses.length, pageCount: Math.ceil(filteredResponses.length/limit)});
    })
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

