function rotation(face){
  turnFace(face);
  currentAngle += rotationAngle;
  if (currentAngle == 90) {
    // Reset parameters
    clearInterval(interval);
    isAnimating = false;
    currentAngle = 0;
    updatePosition(face);
    if (check()) {
      document.getElementById("status").innerHTML = "Solved!";
    } else {
      document.getElementById("status").innerHTML = "Not Solved.";
    }
  }
}
function turnFace(face) {
  var x,y,z;
  var dir,value;
  var mainAxis;
  var m;
  switch (face) {
    case "L":
      mainAxis = 0; value = -1; dir = 1;
    break;
    case "l":
      mainAxis = 0; value = -1; dir = 0;
    break;
    case "M":
      mainAxis = 0;value = 0;dir = 1;
    break;
    case "m":
      mainAxis = 0;value = 0;dir = 0;
    break;
    case "R":
      mainAxis = 0; value = 1; dir = 0;
    break;
    case "r":
      mainAxis = 0; value = 1; dir = 1;
    break;
    case "T":
      mainAxis = 1;value = 1;dir = 0;
    break;
    case "t":
      mainAxis = 1;value = 1;dir = 1;
    break;
    case "B":
      mainAxis = 1;value = -1;dir = 1;
    break;
    case "b":
      mainAxis = 1;value = -1;dir = 0;
    break;
    case "E":
      mainAxis = 1;value = 0;dir = 1;
    break;
    case "e":
      mainAxis = 1;value = 0;dir = 0;
    break;
    case "F":
      mainAxis = 2;value = 1;dir = 0;
    break;
    case "f":
      mainAxis = 2;value = 1;dir = 1;
    break;
    case "K":
      mainAxis = 2;value = -1;dir = 1;
    break;
    case "k":
      mainAxis = 2;value = -1;dir = 0;
    break;
    case "S":
      mainAxis = 2;value = 0;dir = 0;
    break;
    case "s":
      mainAxis = 2;value = 0;dir = 1;
    break;
  }
  for (x = -1; x < 2; x++) {
    for (y = -1; y < 2; y++) {
      for (z = -1; z < 2; z++) {
        // check if cubie is in the plane of the face being turned
        if (cubePosition[x+1][y+1][z+1][mainAxis] == value) {
          m = getRotationMatrix(x,y,z);
          if (!dir) {
            m = mult(m,rotate(rotationAngle,
                            getRotationAxis(x,y,z)[mainAxis]));
          } else {
            m = mult(m,rotate(rotationAngle,
                            negate(getRotationAxis(x,y,z)[mainAxis])));
          }
          setRotationMatrix(x,y,z,m);
        }
      }
    }
  }
}

function swap(x, y, z, i, j, k, val){
  var tmp = [];
  if (cubePosition[x+1][y+1][z+1][i] == val) {
    tmp = cubePosition[x+1][y+1][z+1][j];
    cubePosition[x+1][y+1][z+1][j] = cubePosition[x+1][y+1][z+1][k];
    cubePosition[x+1][y+1][z+1][k] = -tmp;
    tmp = cubePosition[x+1][y+1][z+1][3][k];
    cubePosition[x+1][y+1][z+1][3][k] = negate(cubePosition[x+1][y+1][z+1][3][j]);
    cubePosition[x+1][y+1][z+1][3][j] = tmp;
  }
}

function updatePosition(face){
  var i, j, k, val;
  switch (face){
    case "L":
      i = 0; j = 2; k = 1; val = -1;
      break;
    case "l":
      i = 0; j = 1; k = 2; val = -1;
      break;
    case "R":
      i = 0; j = 1; k = 2; val = 1;
      break;
    case "r":
      i = 0; j = 2; k = 1; val = 1;
    break;
    case "T":
      i = 1; j = 2; k = 0; val = 1;
    break;
    case "t":
      i = 1; j = 0; k = 2; val = 1;
    break;
    case "B":
      i = 1; j = 0; k = 2; val = -1;
    break;
    case "b":
      i = 1; j = 2; k = 0; val = -1;
    break;
    case "E":
      i = 1; j = 0; k = 2; val = 0;
    break;
    case "e":
      i = 1; j = 2; k = 0; val = 0;
    break;
    case "F":
      i = 2; j = 0; k = 1; val = 1;
    break;
    case "f":
      i = 2; j = 1; k = 0; val = 1;
    break;
    case "S":
      i = 2; j = 0; k = 1; val = 0;
    break;
    case "s":
      i = 2; j = 1; k = 0; val = 0;
    break;
    case "K":
      i = 2; j = 1; k = 0; val = -1;
    break;
    case "k":
      i = 2; j = 0; k = 1; val = -1;
    break;
    case "M":
      i = 0; j = 2; k = 1; val = 0;
    break;
    case "m":
      i = 0; j = 1; k = 2; val = 0;
    break;
  }
  for (x = -1; x < 2; x++) {
    for (y = -1; y < 2; y++) {
      for (z = -1; z < 2; z++) {
        swap(x, y, z, i, j, k, val);
      }
    }
  }
}


// Solved iff the orientations of each cube on the surface are the same atm
function check(){
  var ori;
  for (i = 0; i < 3; i++){
    for (j = 0; j < 3; j++){
      // Six faces
      ori = cubePosition[0][0][0][3];
      for (x = -1; x < 2; x++){
        for (y = -1; y < 2; y++){
          for (z = -1; z < 2; z++){
            // Nine cubes on each face
            if (cubePosition[x+1][y+1][z+1][3][i][j] != ori[i][j]){
              if (x == 0 && z == 0){
                if (cubePosition[x+1][y+1][z+1][3][1][j] != ori[1][j]){
                  return false;
                }
              }else if (x == 0 && y == 0){
                if (cubePosition[x+1][y+1][z+1][3][2][j] != ori[2][j]){
                  return false;
                }
              }else if (y == 0 && z == 0){
                if (cubePosition[x+1][y+1][z+1][3][0][j] != ori[0][j]){
                  return false;
                }
              }else{
                return false;
              }
            }
          }
        }
      }
    }
  }
  return true;
}
