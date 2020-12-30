
async function drawLineChart(){
    let dataset = await d3.csv("./data.csv")
    dataset = dataset.map(d => {return {year:d.year, total:parseFloat(d.total), rest: parseFloat(d.rest) , recycle: parseFloat(d.recycle)}})
    var lineChart = new Chart('linechart', {
        type: 'line',
        data: {
            labels: dataset.map(d => d.year),
            datasets: [{
                label: 'kg Abfall pro Person',
                data: dataset.map(d => d.total),
                borderColor: [
                    "#96bdc6"
                ],
                backgroundColor: "transparent",
                pointBackgroundColor: "#96bdc6"
            },
            {
                label: 'kg Restabfall pro Person',
                data: dataset.map(d => d.rest),
                borderColor: [
                    "#d1462f"
                ],
                backgroundColor: "transparent",
                pointBackgroundColor: "#d1462f"
            },
            {
                label: 'kg separat gesammelter Abfall pro Person',
                data: dataset.map(d => d.recycle),
                borderColor: [
                    "#09814a"
                ],
                backgroundColor: "transparent",
                pointBackgroundColor: "#09814a"

            }
        ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            hover: {
                intersect: false
            },
            tooltips: {
                enabled:false,
                intersect: false,
                mode: 'index'
            },
            legend: {
                position: "bottom"
            }
        }
    })
    return [lineChart, dataset]
}

