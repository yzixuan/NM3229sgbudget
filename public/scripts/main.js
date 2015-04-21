var margin = {top: 30, right: 0, bottom: 0, left: 0},
    width = 900,
    height = 520 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var descriptionArray = [
    "Focuses on human needs in the growth and progression of society.",
    "Maintains peace within and the management of external relationships and dealings.",
    "Promote economic growth by improving factors like health, education, working conditions, domestic and international policies and market conditions.",
    "Maintains control of the finance, administration, internal security and law portfolios of the city state.",
    "Formulates and implements education policies. Also controls & administers Government-aided schools and institutes. It also registers private schools.",
    "Guides Singapore’s land use planning, urban redevelopment and building conservation, deliver affordable and quality public housing."
];

document.getElementById('content2013').style.display = 'none';
document.getElementById('content2014').style.display = 'none';

function show2012() {

    document.getElementById("chart2012").innerHTML = "";

    margin = {top: 30, right: 0, bottom: 0, left: 0},
        width = 900,
        height = 520 - margin.top - margin.bottom,
        formatNumber = d3.format(",d"),
        transitioning;

    x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    refresh();
    document.getElementById('newstitle').innerHTML = "BUDGET 2012 IN THE NEWS";
    document.getElementById('content2012').style.display = 'block';
    document.getElementById('content2013').style.display = 'none';
    document.getElementById('content2014').style.display = 'none';
}

refresh();

function refresh() {

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var percentSpent = (d.spent2012/50.11*100).toFixed(2);
        var change1 = ((d.spent2013 - d.spent2012)/(d.spent2012)*100).toFixed(2);
        var change2 = ((d.spent2014 - d.spent2013)/(d.spent2013)*100).toFixed(2);

        var id = 0;
        if (d.id != undefined)
            id = d.id;

            var revenue;
            if (d.revenue != undefined)
                revenue = "<strong>Estimated Revenue: </strong>$" + d.revenue;
            else
                revenue = "No revenue estimates available.";

        var color2, sign2 = "";
        if (change2 > 0) {
            color2 = "green";
            sign2 = "+"
        }
        else if (change2 < 0)
            color2 = "red";

        var color1, sign1 = "";
        if (change1 > 0) {
            color1 = "green";
            sign1 = "+";
        }
        else if (change1 < 0)
            color1 = "red";


        if (percentSpent < 0.01)
            return ("<h4><strong>" + d.name + "</strong></h4>" +
                "<p>" + descriptionArray[id] + "</p>" +
                "<p>(less than 0.01% of total budget)</p><hr/>" +
                "<p class='alignleft'><strong>Expenditure:</strong></p>" + "<p class='alignright'><strong>Change:</strong></p><br/><br/>" +
                "<p class='alignleft up'><strong>2014: </strong>$" + d.spent2014 + " billion</p>" + "<p class='alignright up " + color2 + "'> (" + sign2 + change2 + "%)</p><br/><br/>" +
                "<p class='alignleft up2'><strong>2013: </strong>$" + d.spent2013 + " billion</p>" + "<p class='alignright up2 " + color1 + "'> (" + sign1 + change1 + "%)</p><br/><br/>" +
                "<p class='alignleft up3'><strong>2012: </strong>$" + d.spent2012 + " billion</p><hr/>" +
                "<p class='description'>" + revenue + "</p>"
                    );
        else
            return ("<h4><strong>" + d.name + "</strong></h4>" +
                    "<p class='percentage'>(" + percentSpent + "% of total budget" + ")</p>" +
                    "<p class='description'>" + descriptionArray[id] + "</p><hr/>" +
                    "<p class='alignleft'><strong>Expenditure:</strong></p>" + "<p class='alignright'><strong>Change:</strong></p><br/><br/>" +
                    "<p class='alignleft up'><strong>2014: </strong>$" + d.spent2014 + " billion</p>" + "<p class='alignright up " + color2 + "'> (" + sign2 + change2 + "%)</p><br/><br/>" +
                    "<p class='alignleft up2'><strong>2013: </strong>$" + d.spent2013 + " billion</p>" + "<p class='alignright up2 " + color1 + "'> (" + sign1 + change1 + "%)</p><br/><br/>" +
                    "<p class='alignleft up3'><strong>2012: </strong>$" + d.spent2012 + " billion</p><hr/>" +
                    "<p class='description'>" + revenue + "</p>"
                    );
      });


    var svg = d3.select("#chart2012").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    svg.call(tip);

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", 24);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - 20)
        .attr("dy", ".35em");


    d3.json("data/SG2012.json", function (root) {
        initialize(root);
        accumulate(root);
        layout(root);
        display(root);

        function initialize(root) {
            root.x = root.y = 0;
            root.dx = width;
            root.dy = height;
            root.depth = 0;
        }

        function accumulate(d) {
            return (d._children = d.children)
                ? d.value = d.children.reduce(function (p, v) {
                return p + accumulate(v);
            }, 0)
                : d.value;
        }

        function layout(d) {
            if (d._children) {
                treemap.nodes({_children: d._children});
                d._children.forEach(function (c) {
                    c.x = d.x + c.x * d.dx;
                    c.y = d.y + c.y * d.dy;
                    c.dx *= d.dx;
                    c.dy *= d.dy;
                    c.parent = d;
                    layout(c);
                });
            }
        }

        function display(d) {
            grandparent
                .datum(d.parent)
                .on("click", transition)
                .select("text")
                .text(name(d));

            var g1 = svg.insert("g", ".grandparent")
                .datum(d)
                .attr("class", "depth");

            var g = g1.selectAll("g")
                .data(d._children)
                .enter().append("g");

            g.filter(function (d) {
                return d._children;
            })
                .classed("children", true)
                .on("click", transition);

            g.selectAll(".child")
                .data(function (d) {
                    return d._children || [d];
                })
                .enter().append("rect")
                .attr("class", "child")
                .call(rect);

            g.append("rect")
                .attr("class", "parent")
                .style("fill", function (d) {
                    return d.color;
                })
                .call(rect)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            // NAME OF THE SECTOR
            text_node = g.append("text")
                .attr("x", function(t) {
                    return t.x + 12 + "px" })
                .attr("y", function(t) {
                    return t.y + 12 + "px" });
            text_node.append("tspan")
                .attr("class", "ministry")
                .style("font-size", function(d) {
                    if (d.fontsize != undefined)
                        return d.fontsize + "em";
                    else if (d.small == "true")
                        return "1.6em";
                })
                .text(function (d) {
                    return d.name;
                })
                .attr("dy", function(d) {
                    if (d.small == "true")
                        return 20;
                    else
                        return 35;})
                .attr("dx", 10);


            // EXPENDITURE (EXPENSE IN SGD)
            text_node = g.append("text")
                .attr("x", function(t) {
                    return t.x + 12 + "px" })
                .attr("y", function(t) {
                    return t.y + 12 + "px" });
            text_node.append("tspan")
                .attr("class", "money")
                .style("font-weight", "bold")
                .text(function (d) {
                    if (d.small == "true")
                        return "";
                    else
                        return "Expenditure: " + "$" + d.spent2012 + " billion";
                })
                .attr("dy", function(d) {
                    if (d.small == "true")
                        return 40;
                    else
                        return 60;})
                .attr("dx", 10);

            // PERCENTAGE OF BUDGET
            text_node = g.append("text")
                .attr("x", function(t) {
                    return t.x + 12 + "px" })
                .attr("y", function(t) {
                    return t.y + 12 + "px" });
            text_node.append("tspan")
                .attr("class", "money")
                .text(function (d) {
                    if (d.small == "true")
                        return "";
                    else
                        return "(" + (d.spent2012/50.11*100).toFixed(2) + " % of total budget)";
                })
                .attr("dy", function(d) {
                    if (d.small == "true")
                        return 60;
                    else
                        return 80;})
                .attr("dx", 10);

            // ESTIMATED REVENUE (IF POSSIBLE)
            text_node = g.append("text")
                .attr("x", function(t) {
                    return t.x + 12 + "px" })
                .attr("y", function(t) {
                    return t.y + 12 + "px" });
            text_node.append("tspan")
                .attr("class", "money")
                .style("font-weight", "bold")
                .text(function (d) {
                    if (d.small == "true" || d.revenue == undefined || d.small2 == "true")
                        return "";
                    else
                        return "Est Revenue: " + "$" + d.revenue;
                })
                .attr("dy", 110)
                .attr("dx", 10);

            function transition(d) {
                if (transitioning || !d) return;
                transitioning = true;

                var g2 = display(d),
                    t1 = g1.transition().duration(750),
                    t2 = g2.transition().duration(750);

                // Update the domain only after entering new elements.
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);

                // Enable anti-aliasing during the transition.
                svg.style("shape-rendering", null);

                // Draw child nodes on top of parent nodes.
                svg.selectAll(".depth").sort(function (a, b) {
                    return a.depth - b.depth;
                });

                // Fade-in entering text.
                g2.selectAll("text").style("fill-opacity", 0);

                // Transition to the new view.
                t1.selectAll("text").call(text).style("fill-opacity", 0);
                t2.selectAll("text").call(text).style("fill-opacity", 1);
                t1.selectAll("rect").call(rect);
                t2.selectAll("rect").call(rect);

                // Remove the old node when the transition is finished.
                t1.remove().each("end", function () {
                    svg.style("shape-rendering", "crispEdges");
                    transitioning = false;
                });
            }

            return g;
        }

        function text(text) {
            text.attr("x", function (d) {
                return x(d.x) + 6;
            })
                .attr("y", function (d) {
                    return y(d.y) + 6;
                });
        }

        function rect(rect) {
            rect.attr("x", function (d) {
                return x(d.x);
            })
                .attr("y", function (d) {
                    return y(d.y);
                })
                .attr("width", function (d) {
                    return x(d.x + d.dx) - x(d.x);
                })
                .attr("height", function (d) {
                    return y(d.y + d.dy) - y(d.y);
                });
        }

        function name(d) {
            return d.parent
                ? name(d.parent) + " > " + d.name
                : d.name;
        }
    }); }