
/* add code here */
var daysOfWeek = new Array("Mon", "Tues", "Wed", "Thur", "Fri");
daysOfWeek.push("Sat");
daysOfWeek.unshift("Sun");

//document.write(daysOfWeek+"<br/>");
document.write("<table	border=1>");
document.write("<tr>");

for (i = 0; i < daysOfWeek.length; i++) {
    if (daysOfWeek[i].length < 4)
        day = daysOfWeek[i];
    else
        day = "<em>" + daysOfWeek[i] + "</em>";
    document.write("<th>" + day + "</th>");
}

var date = 1;
for (row = 1; row <= 5; row++) {
    document.write("<tr>");
    for (col = 1; col <= 7; col++) {
        if (date <= 30) {
            document.write("<td>" + date + "</td>");
            date++;
        }
    }
    document.write("</tr>");
}
document.write("</table>");
