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

var jsonFile = "data/SG2012.json";

function resetAll() {
    var div = document.getElementById('content');
    div.innerHTML = "hello";
}

refresh(jsonFile);

function refresh(jsonFile) {

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var percentSpent = (d.spent2012/50.11*100).toFixed(2);
        var change1 = ((d.spent2013 - d.spent2012)/(d.spent2012)*100).toFixed(2);
        var change2 = ((d.spent2014 - d.spent2013)/(d.spent2013)*100).toFixed(2);
        
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
                "<p>< 0.01% of overall budget</p><hr/>" +
                "<p class='alignleft'><strong>2014: </strong>" + d.spent2014 + " billion</p>" + "<p class='alignright " + color2 + "'> (" + sign2 + change2 + "%)</p><br/><br/>" +
                "<p class='alignleft up'><strong>2013: </strong>" + d.spent2013 + " billion</p>" + "<p class='alignright up " + color1 + "'> (" + sign1 + change1 + "%)</p><br/><br/>" +
                "<p class='alignleft up2'><strong>2012: </strong>" + d.spent2012 + " billion</p>"
                    );
        else
            return ("<h4><strong>" + d.name + "</strong></h4>" +
                    "<p>" + percentSpent + "% of overall budget" + "</p><hr/>" +
                    "<p class='alignleft'><strong>2014: </strong>" + d.spent2014 + " billion</p>" + "<p class='alignright " + color2 + "'> (" + sign2 + change2 + "%)</p><br/><br/>" +
                    "<p class='alignleft up'><strong>2013: </strong>" + d.spent2013 + " billion</p>" + "<p class='alignright up " + color1 + "'> (" + sign1 + change1 + "%)</p><br/><br/>" +
                    "<p class='alignleft up2'><strong>2012: </strong>" + d.spent2012 + " billion</p>"
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

    d3.json(jsonFile, function (root) {
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

        // Aggregate the values for internal nodes. This is normally done by the
        // treemap layout, but not here because of our custom implementation.
        // We also take a snapshot of the original children (_children) to avoid
        // the children being overwritten when when layout is computed.
        function accumulate(d) {
            return (d._children = d.children)
                ? d.value = d.children.reduce(function (p, v) {
                return p + accumulate(v);
            }, 0)
                : d.value;
        }

        // Compute the treemap layout recursively such that each group of siblings
        // uses the same size (1×1) rather than the dimensions of the parent cell.
        // This optimizes the layout for the current zoom state. Note that a wrapper
        // object is created for the parent node for each group of siblings so that
        // the parent’s dimensions are not discarded as we recurse. Since each group
        // of sibling was laid out in 1×1, we must rescale to fit using absolute
        // coordinates. This lets us use a viewport to zoom.
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
                        return "Spent: ";
                })
                .attr("dy", function(d) {
                    if (d.small == "true")
                        return 40;
                    else
                        return 60;})
                .attr("dx", 10);

            text_node.append("tspan")
                .attr("class", "money")
                .text(function (d) {
                    if (d.small == "true")
                        return "";
                    else
                        return "$" + d.spent2012 + " billion";
                })
                .attr("dy", 0)
                .attr("dx", 0);

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
    });
}