/*
Brainy - Brainstorm your mind
Written by Yessine Taktak
hotkeys :
  - a : Add idea
  - {ENTER} : Submit idea
  - {ESC} : Clear selection - break current job
  - x : Export plan as JSON
  - d : Delete idea
  - m : move selected item
*/
function loadGraph(idease) {
  var canvas = document.getElementById("canvas");
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;
  var context = canvas.getContext("2d");

  if(idease != "") {
    var ideas = idease;
  } else {
    var ideas = new Array();
  }
  var selected_ideas = new Array();
  var typing = {
    state : false,
    id : 0,
    id_text : 0
  };

  var colors = ["#44BBFF", "#112233", "#66CC99", "#FC575E"];
  var contextm = {
    down : false,
    move : false,
    context_x : 0,
    context_y : 0
  }

  var mouse = {
    x : 0,
    y : 0,
    ox : 0,
    oy : 0,
    dx : 0,
    dy : 0,
    down : false,
    downtype : 0
  }
  var control_clicked = false;
  var linking = false;
  var linking_id = 0;

  var context_items = [
    {
      title : "Move idea",
      icon : "\uF047",
      x : 35,
      y : 25
    },
    {
      title : "Delete idea",
      icon : "\uF00d",
      x : 35,
      y : 60
    },
    {
      title : "Add Flag",
      icon : "\uF024",
      x : 35,
      y : 95
    },
    {
      title : "Add Link",
      icon : "\uf07e",
      x : 35,
      y : 133
    }
  ]
  var flags = [
    {
      type : "Important",
      icon : "\uf12a",
      x : 210,
      y : 7
    },
    {
      type : "Main Idea",
      icon : "\uf084",
      x : 210,
      y : 42
    },
    {
      type : "Risky",
      icon : "\uf071",
      x : 210,
      y : 79
    },
    {
      type : "Primary",
      icon : "\uf069",
      x : 210,
      y : 116
    }
  ]
  var selected_context_item_id = -1;
  var selected_flag_id = -1;
  update();

  window.oncontextmenu = function(e) {
    return false;
  }
  document.addEventListener("mousedown", function(e) {
    mouse.ox = mouse.x;
    mouse.oy = mouse.y;
    mouse.dx = e.clientX;
    mouse.dy = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.down = true;
    mouse.downtype = e.button;
    if(mouse.downtype == 2) {
      if(contextm.move) {
        contextm.move = false;
      } else {
        if(selected_ideas.length > 0) {
          contextm.down = true;
          contextm.context_x = mouse.x;
          contextm.context_y = mouse.y;
        }
      }
    } else if(mouse.downtype == 0) {
      if(contextm.down) {
        switch(selected_context_item_id) {
          case 0:
            contextm.move = true;
            break;
          case 1:
            ideas.splice(selected_ideas[0],1);
            selected_ideas = [];
            break;
          case 2:
            ideas[selected_ideas[0]].flag = flags[selected_flag_id].icon;
            selected_context_item_id = -1;
            break;
          case 3:
            linking = true;
            break;
        }
      }
      if(contextm.down) {
        contextm.down = false;
      }
    }
    if(linking) {
      linking_id++;
      if(linking_id == 2) {
        linking = false;
        linking_id = 0;
      }
    }
  })
  document.addEventListener("mousemove", function(e) {
    mouse.ox = mouse.x;
    mouse.oy = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  })
  document.addEventListener("mouseup", function() {
    mouse.down = false;
  })

  document.addEventListener("keydown", function(e) {
    if(!typing.state) {
      switch(e.keyCode) {
        case 65:
          if(!control_clicked) {
            addPrototype();
          } else {
            for(var i=0; i<ideas.length; i++) {
              selected_ideas.push(i);
            }
          }

          break;
        case 27:
          for(var i=0; i<selected_ideas.length; i++) {
            ideas[selected_ideas[i]].border_color = "rgba(149, 165, 166,1.0)";
          }
          if(linking) {
            if(selected_ideas.length > 0) {
              ideas[selected_ideas[0]].linkTo = -1;
              ideas[selected_ideas[0]].linked = false;
            }
            linking = false;
          }
          selected_ideas = [];
          break;
        case 77:
          contextm.move = true;
          break;
        case 68:
          ideas.splice(selected_ideas[0],1);
          selected_ideas = [];
          break;
        case 17:
          control_clicked = true;
          break;
        case 88:
          exporte();
          break;
      }
    } else {
      if(typing.id_text == 0) {
        ideas[typing.id].text = "";
        ideas[typing.id].color = "#0A3542";
        typing.id_text = 1;
      }
      if(e.keyCode != 13 && e.keyCode != 8) {
        ideas[typing.id].text += String.toLowerCase(String.fromCharCode(e.keyCode));
      } else if(e.keyCode == 8) {
        ideas[typing.id].text = ideas[typing.id].text.slice(0, ideas[typing.id].text.length-1);
      } else {
        typing.id = 0;
        typing.id_text = 0;
        typing.state = false;
      }
    }
  })
  document.addEventListener("keyup", function(e) {
    switch(e.keyCode) {
      case 17:
        control_clicked = false;
        break;
    }
  });
  function update() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#D0CFCF";
    context.fillRect(0, 0, width, height);
    /* Draw prototypes */
    for(var i=0; i<ideas.length; i++) {
      context.beginPath();
      context.fillStyle = ideas[i].color;
      context.font = "19px FontAwesome";
      context.fillStyle = "#FC575E";
      context.fillText(ideas[i].flag, ideas[i].x-23, ideas[i].y+3);
      context.font = "19px Arial";
      context.fillStyle = "#112233";
      context.fillText(ideas[i].text, ideas[i].x, ideas[i].y);
      context.fillStyle = ideas[i].border_color;
      context.fillRect(ideas[i].x-2, ideas[i].y+10, 9*ideas[i].text.length, 2);
      if(ideas[i].linked) {
        context.beginPath();
        context.moveTo(ideas[i].x+((ideas[i].text.length*9)/2), ideas[i].y+7);
        context.lineTo(ideas[ideas[i].linkTo].x+((ideas[ideas[i].linkTo].text.length*9)/2), ideas[ideas[i].linkTo].y+7);
        context.lineWidth = 0.8;
        context.strokeStyle = ideas[i].lcolor;
        context.stroke();
      }
    }
    for(var i=0; i<selected_ideas.length; i++) {
      ideas[selected_ideas[i]].border_color = "rgba(231, 76, 60,1.0)";
    }
    /* Mouse Checking */
    if(linking) {
      for(var i=0; i<ideas.length; i++) {
        if(pointInRect(mouse.x, mouse.y, {
          x : ideas[i].x-((ideas[i].text.length*9)/2),
          y : ideas[i].y-10,
          width : ideas[i].text.length*9,
          height : 20
        })) {
          if(selected_ideas.length > 0 && i != selected_ideas[0]) {
            ideas[selected_ideas[0]].linkTo = i;
            ideas[selected_ideas[0]].linked = true;
          }
        }
      }
    }
    if(mouse.down && mouse.downtype == 0) {
      context.fillStyle = "rgba(52, 152, 219,0.7)";
      context.fillRect(mouse.dx, mouse.dy, mouse.x-mouse.dx, mouse.y-mouse.dy);
      for(var i=0; i<ideas.length; i++) {
        if((ideas[i].x < mouse.x) && (ideas[i].x > mouse.dx) && (ideas[i].y < mouse.y) && (ideas[i].y > mouse.dy)
        ||
        (ideas[i].x > mouse.x) && (ideas[i].x < mouse.dx) && (ideas[i].y > mouse.y) && (ideas[i].y < mouse.dy)
        ) {
          selected_ideas.push(i);
        }
      }
    }
    /* Context functions */
    if(contextm.move) {

      if(selected_ideas.length > 0) {
        ideas[selected_ideas[0]].x += (mouse.x-ideas[selected_ideas[0]].x)*.1;
        ideas[selected_ideas[0]].y += (mouse.y-ideas[selected_ideas[0]].y)*.1;
      }
    }

    if(contextm.down && selected_ideas.length > 0) {
      context.beginPath();
      context.fillStyle = "rgba(189, 195, 199,1.0)";
      context.fillRect(contextm.context_x, contextm.context_y, 170, 146);
      for(var i=0; i<context_items.length; i++) {
        drawContext(context_items[i].title, context_items[i].icon, context_items[i].x, context_items[i].y);
      }
      for(var i=0; i<context_items.length; i++) {
        if(pointInRect(mouse.x, mouse.y, {
          x : contextm.context_x,
          y : contextm.context_y+(i*30),
          width : 170,
          height : 35
        })) {
          context.beginPath();
          context.fillStyle = "rgba(52, 152, 219,0.4)";
          context.fillRect(contextm.context_x, contextm.context_y+(i*36), 170, 36);
          selected_context_item_id = i;
        }
      }
    }
    if(selected_context_item_id == 2) {
      context.fillStyle = "rgba(189, 195, 199,1.0)";
      context.fillRect(contextm.context_x+170, contextm.context_y+71, 170, 148);
      for(var i=0; i<flags.length; i++) {
        drawSContext(flags[i].type, flags[i].icon, flags[i].x, flags[i].y);
      }
      for(var i=0; i<flags.length; i++) {
        if(pointInRect(mouse.x, mouse.y, {
          x : contextm.context_x+170,
          y : contextm.context_y+(37*i)+71,
          width : 170,
          height : 37
        })) {
          context.beginPath();
          context.fillStyle = "rgba(52, 152, 219,0.4)";
          context.fillRect(contextm.context_x+170, contextm.context_y+(i*37)+71, 170, 37);
          selected_flag_id = i;
        }
      }
    }
    requestAnimationFrame(update);
  }
  function addPrototype() {
    ideas.push({
      x : mouse.x,
      y : mouse.y,
      text : "Type anything ...",
      color : "#AAAAAA",
      border_color : "rgba(149, 165, 166,1.0)",
      flag : "",
      linkTo : -1,
      linked : false,
      lcolor : colors[Math.floor(Math.random()*colors.length)]
    });
    typing.state = true;
    typing.id = ideas.length-1;
  }
  function drawContext(title, icon, x, y) {
    context.font = "18px Arial";
    context.fillStyle = "#112233";
    context.fillText(title, contextm.context_x+x, contextm.context_y+y);
    context.font = "18px FontAwesome";
    context.fillStyle = "#FC575E";
    context.fillText(icon, contextm.context_x+(x-25), contextm.context_y+y);
    context.fillStyle = "#112233";
    context.fillRect(contextm.context_x, contextm.context_y+y+11, 170, 1);
  }
  function drawSContext(title, icon, x, y) {
    context.font = "18px Arial";
    context.fillStyle = "#112233";
    context.fillText(title, contextm.context_x+x, contextm.context_y+y+90);
    context.font = "18px FontAwesome";
    context.fillStyle = "#FC575E";
    context.fillText(icon, contextm.context_x+(x-25), contextm.context_y+90+y);
    context.fillStyle = "#112233";
    context.fillRect(contextm.context_x+170, contextm.context_y+y+11+90, 170, 1);
  }
  function inRange(value, min, max) {
		return value >= Math.min(min, max) && value <= Math.max(min, max);
  }
  function pointInRect(x, y, rect) {
		return inRange(x, rect.x, rect.x + rect.width) &&
		       inRange(y, rect.y, rect.y + rect.height);
  }

  function exporte() {
    var string_data = "";
    string_data += "{";
    string_data += '"Comment" : "Generated by Brainy - Brainstorm your mind",';
    string_data += '"ideas" : ';
    string_data += JSON.stringify(ideas);
    string_data += "}"
    var blob = new Blob([string_data], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}
window.onload = function() {
  filename = window.location.hash.replace("#", "");
  if(filename != "") {
    var x = new XMLHttpRequest;
    x.open("GET", filename, 1);
    x.send();
    x.onreadystatechange = function() {
      if(x.readyState == 4 && x.status == 200) {
        data = JSON.parse(x.responseText);
        loadGraph(data.ideas);
      }
    }
  } else {
    loadGraph("");
  }

}
