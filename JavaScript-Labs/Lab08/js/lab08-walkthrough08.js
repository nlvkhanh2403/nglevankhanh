// define functions in this file
// this variable has global scope
boxClass = 'movingDiv';
function outputBox(num) {
    box = "<div	class='" + boxClass + "'	id='div" + num + "'>";
    box += "This	is	div	" + num;
    box += "</div>";
    return box;
}