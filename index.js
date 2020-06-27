function addText(point, content, boundingBox, options) {
  if (!options) {
    options = {};
  }
  var text = new PointText(point);
  text.justification = "center";
  text.strokeColor = options.color || "black";
  text.content = content;
  text.visible = true;
  text.fitBounds(boundingBox);
  return text;
}

function isEven(n) {
  return BigInt(n) % BigInt(2) == 0
}

function constructTriangle(numLayers) {
  var trianglePath = new CompoundPath();
  var evenPath = new CompoundPath({ visible: false, fillColor: "beige" });
  var unevenPath = new CompoundPath({ visible: false, fillColor: "black" });
  trianglePath.strokeColor = "black";
  var path = new Path();
  path.strokeColor = "black";

  // Simple triangle
  var triangleX = view.center.x;
  var triangleY = view.center.y * 2;
  var top = view.center - new Point(0, view.center.y);
  var bottomLeftVector = new Point(-triangleX, triangleY);
  var bottomRightVector = bottomLeftVector * new Point(-1, 1);
  path.add(top + bottomLeftVector, top, top + bottomRightVector);
  path.closed = true;

  var bottomLeftTraveler = bottomLeftVector / numLayers;
  var bottomRightTraveler = bottomRightVector / numLayers;
  var layers = [[BigInt(1)]];

  function addLayer(nthLayer) {
    // horizontal dividers
    var horizontalDivider = new Path();
    var divisionLeft = top + bottomLeftTraveler * nthLayer;
    var divisionRight = top + bottomRightTraveler * nthLayer;
    horizontalDivider.add(divisionLeft, divisionRight);

    // vertical dividers and content
    var currentLayer = [];
    var horizontalTravelerVector = (divisionRight - divisionLeft) / nthLayer;
    var curPosition = divisionLeft + horizontalTravelerVector;
    var coefficientIndex = 0;
    var lastLayer = layers[i - 1];
    while (curPosition.x < divisionRight.x - 1) {
      var verticalDivider = new Path();
      verticalDivider.add(
        curPosition,
        curPosition - new Point(0, bottomLeftTraveler.y)
      );
      var midPoint =
        curPosition -
        new Point(horizontalTravelerVector / 2, bottomLeftTraveler.y / 2);
      var left = lastLayer[coefficientIndex - 1] || BigInt(0);
      var right = lastLayer[coefficientIndex] || BigInt(0);
      var binomialCoefficient = left + right;
      var boundingBox = new Rectangle(
        curPosition -
          new Point(horizontalTravelerVector.x, bottomLeftTraveler.y),
        curPosition
      );
      trianglePath.addChild(
        addText(midPoint, binomialCoefficient, boundingBox)
      );
      var r = new Path.Rectangle({ rectangle: boundingBox })
      if (isEven(binomialCoefficient)) {
        evenPath.addChild(r);
      } else {
        unevenPath.addChild(r);
      }
      coefficientIndex++;
      currentLayer.push(binomialCoefficient);
      curPosition += horizontalTravelerVector;
      trianglePath.addChild(verticalDivider);
    }

    // Add the last one
    var midPoint =
      curPosition -
      new Point(horizontalTravelerVector / 2, bottomLeftTraveler.y / 2);
    var left = lastLayer[coefficientIndex - 1] || BigInt(0);
    var right = lastLayer[coefficientIndex] || BigInt(0);
    var binomialCoefficient = left + right;
    var boundingBox = new Rectangle(
      curPosition - new Point(horizontalTravelerVector.x, bottomLeftTraveler.y),
      curPosition
    );
    var r = new Path.Rectangle({ rectangle: boundingBox })
    if (isEven(binomialCoefficient)) {
      evenPath.addChild(r);
    } else {
      unevenPath.addChild(r);
    }
    trianglePath.addChild(addText(midPoint, binomialCoefficient, boundingBox));
    currentLayer.push(binomialCoefficient);
    layers.push(currentLayer);
    trianglePath.addChild(horizontalDivider);
  }

  var i = 1;
  while (i <= numLayers) {
    addLayer(i);
    i++;
  }
  trianglePath.addChild(path);
  console.log(layers)
  return [trianglePath, evenPath, unevenPath];
}

var removeLayerButton = new Path.Circle({
  center: new Point(view.bounds.rightCenter) + new Point(-30, 95),
  radius: 30,
  strokeColor: "black",
});
removeLayerButton.fillColor = {
  gradient: {
    stops: ["yellow", "red", "blue"],
  },
  origin: removeLayerButton.bounds.topLeft,
  destination: removeLayerButton.bounds.bottomRight,
};

addText(removeLayerButton.center, "-", removeLayerButton.bounds);

var addLayerButton = new Path.Circle(
  new Point(view.bounds.rightCenter - new Point(30, 35)),
  30
);
addLayerButton.strokeColor = "black";
addLayerButton.fillColor = "green";
addText(addLayerButton.center, "+", addLayerButton.bounds);
addLayerButton.fillColor = {
  gradient: {
    stops: ["yellow", "green", "blue"],
  },
  origin: addLayerButton.bounds.topLeft,
  destination: addLayerButton.bounds.bottomRight,
};

var rotateButton = new Path.Circle(
  new Point(view.bounds.rightCenter - new Point(30, 100)),
  30
);
rotateButton.strokeColor = "black";
rotateButton.fillColor = "green";
addText(addLayerButton.center, "Flip", rotateButton.bounds);
rotateButton.fillColor = {
  gradient: {
    stops: ["pink", "purple", "yellow"],
  },
  origin: rotateButton.bounds.topLeft,
  destination: rotateButton.bounds.bottomRight,
};

function modeButton(content) {
  var sierpinskiToggleButton = new Path.Rectangle({
    point: view.bounds.rightCenter - new Point(60, 0),
    size: 60,
    strokeColor: "black",
    fillColor: {
      gradient: {
        stops: ["grey", "black"],
      },
    },
  });
  sierpinskiToggleButton.fillColor = {
    gradient: {
      stops: ["grey", "black"],
    },
    origin: sierpinskiToggleButton.bounds.topLeft,
    destination: sierpinskiToggleButton.bounds.bottomRight,
  };
  sierpinskiToggleButton.addChild(
    addText(
      sierpinskiToggleButton.center,
      content,
      sierpinskiToggleButton.bounds,
      { color: "white" }
    )
  );
  return sierpinskiToggleButton;
}

var sierpinski = false;
var currentModeButton = modeButton("sierpinski");
var configuredNumLayers = 10;
var paths = constructTriangle(configuredNumLayers, sierpinski);
var trianglePath = paths[0];
var evenPath = paths[1];
var unevenPath = paths[2];

function toggleMode(sierpinskiMode, trianglePath, evenPath, unevenPath) {
  if (sierpinskiMode) {
    trianglePath.visible = false;
    evenPath.visible = true;
    unevenPath.visible = true;
  } else {
    trianglePath.visible = true;
    evenPath.visible = false;
    unevenPath.visible = false;
  }
}

var globs = {}
function onMouseDown(event) {
  if (event.point.isInside(addLayerButton.bounds)) {
    paths.map(function (x) {
      x.remove();
    });
    paths = constructTriangle(++configuredNumLayers);
    trianglePath = paths[0];
    evenPath = paths[1];
    unevenPath = paths[2];
    toggleMode(sierpinski, trianglePath, evenPath, unevenPath);
  }
  if (event.point.isInside(removeLayerButton.bounds)) {
    paths.map(function (x) {
      x.remove();
    });
    paths = constructTriangle(--configuredNumLayers);
    trianglePath = paths[0];
    evenPath = paths[1];
    unevenPath = paths[2];
    toggleMode(sierpinski, trianglePath, evenPath, unevenPath);
  }
  if (event.point.isInside(currentModeButton.bounds)) {
    currentModeButton.remove();
    currentModeButton = modeButton(sierpinski ? "pascal" : "sierpinski");
    sierpinski = !sierpinski;
    toggleMode(sierpinski, trianglePath, evenPath, unevenPath);
  }
  if (event.point.isInside(rotateButton.bounds)) {
      globs.rotateCounter = 180
  }
}

// background
var background = new Path.Rectangle({
  point: view.topLeft,
  size: view.size,
  selected: true,
  fillColor: "beige"
});

background.fitBounds(view.bounds);

background.sendToBack();

function onFrame(event) {
    if (globs.rotateCounter > 0) {
        paths.map(function(x) {x.rotate(3, center=view.center)})
        globs.rotateCounter -= 3
    }
}