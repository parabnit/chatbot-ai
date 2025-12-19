const memory = [];

function addToMemory(text) {
  memory.push(text);
}

function getMemory() {
  return memory;
}

module.exports = { addToMemory, getMemory };
