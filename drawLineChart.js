
//Chart.plugins.register(ChartRough);
Chart.defaults.global.defaultFontFamily = '"Indie Flower", cursive';
Chart.defaults.global.defaultFontSize = 16;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
   draw: function(ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);
        var x = -10,
            ctx = this.chart.ctx,
            topY = this.chart.chartArea.top,
            bottomY = this.chart.chartArea.bottom;

        if (this.chart.hoverLine){
            x = this.chart.hoverLine.x
        }

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {

            var activePoint = this.chart.tooltip._active[0]
            if (activePoint.tooltipPosition().x){
                x = activePoint.tooltipPosition().x
                this.chart.hoverLine = {}
                this.chart.hoverLine.x = x
            }     
            
                
        }
        // draw line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#666666';
        ctx.stroke();
        ctx.restore();
   }
});


async function drawLineChart(){
    let dataset = await d3.csv("./data.csv")
    dataset = dataset.map(d => {return {year:d.year, total:parseFloat(d.total), rest: parseFloat(d.rest) , recycle: parseFloat(d.recycle)}})
    var lineChart = new Chart("linechart", {
        type: 'LineWithLine',
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
                }],
                xAxes: [{
                    ticks: {
                        stepSize: 1
                    }
                }]

            },
            hover: {
                intersect: false
            },
            tooltips: {
                enabled:false,
                intersect: false,
                mode: 'index',
                axis: 'x'
            },
            legend: {
                position: "bottom"
            }
        }
    })
    return [lineChart, dataset]
}

