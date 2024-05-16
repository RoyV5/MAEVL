
//Selects first pokemon input
const calculateBtn = document.getElementById('calculateBtn')
const suggestionsContainer = document.getElementById('suggestionsA');
let growthArray = [];
let expArray = [];
let yieldsArray = [];
let pokemonInputA, pokemonInputB, levelInputA, levelInputB, initialExp, finalExp, levelCap;

fetch('exp_ev_yields.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(obj => {
      yieldsArray.push(obj);
    });
  })
console.log(yieldsArray)

fetch('exp_lookup.json')
.then(response => response.json())
.then(data => {
  data.forEach(obj => {
    expArray.push(obj);
  });
})
.catch(error => console.error('Error reading JSON file:', error));
console.log(expArray)

fetch('growth_rate.json')
.then(response => response.json())
.then(data => {
  data.forEach(obj => {
    growthArray.push(obj);
  });
})
.catch(error => console.error('Error reading JSON file:', error));
console.log(growthArray)

function spRound(number) {
    return Math.round(number / (1/4096)) * 1/4096;
}

function yieldLookup(searchPokemon) {
  let result = [];
  let control = true;
  let counter = 0;
  while (control && counter < yieldsArray.length) {
    if (yieldsArray[counter]['Column 3'].toLowerCase().localeCompare(searchPokemon.toLowerCase() + "\n") == 0) {
      result = [
        yieldsArray[counter]['Column 4'], 
        yieldsArray[counter]['Column 5'], 
        yieldsArray[counter]['Column 6'], 
        yieldsArray[counter]['Column 7'], 
        yieldsArray[counter]['Column 8'], 
        yieldsArray[counter]['Column 9'], 
        yieldsArray[counter]['Column 10'], 
        yieldsArray[counter]['Column 11']
      ];
      control = false;
    } else {
      counter += 1;
    }
  }
  return result;
}

function growthLookup(searchPokemon) {
    let result;
    let control = true;
    let counter = 0;
    while (control && counter < growthArray.length) {
      if (growthArray[counter]['Column 3'].toLowerCase().localeCompare(searchPokemon.toLowerCase() + "\n") == 0) {
        result = growthArray[counter]['Column 4'];
        control = false;
      } else {
        counter += 1;
      }
    }
    return result;
  }

function expLookup(growthRate, level) {

    return expArray[Number(level)][getColumn(growthRate)];
}


function getColumn(input) {
    switch (input) {
        case "Erratic":
            return "Column 8";
        case "Fast":
            return "Column 9";
        case "Medium Fast":
            return "Column 10";
        case "Medium Slow":
            return "Column 11";
        case "Slow":
            return "Column 12";
        case "Fluctu­ating":
            return "Column 13";
        default:
            return "Invalid input";
    }
}

function expGain(b, Lp, L) {
    b = Number(b)
    Lp = Number(Lp)
    L= Number(L)
    return Math.round((b*L/5) * ((spRound(Math.sqrt(2*L + 10)) * (Math.pow(2*L + 10, 2))) / (spRound(Math.sqrt(L + Lp + 10)) * (Math.pow(L + Lp + 10, 2)))) + 1);
}

function EVGain(EVs, baseExp, levelInputA, levelInputB, initialExp, finalExp, levelCap, growthRate) {
    let EVMultiplier = 0;
    let currentLevel = Number(levelInputA);
    let remainingExp = Number(initialExp)
    ;
    let gainedExp = expGain(baseExp, currentLevel, levelInputB);
    let remainder = 0;
    let control = true;

    while (currentLevel <= levelCap && control) {
        if (currentLevel < levelCap) {
            EVMultiplier += Math.floor(remainingExp / gainedExp);
            remainder = remainingExp % gainedExp;
            currentLevel += 1;
            remainingExp = expLookup(growthRate, currentLevel) - (gainedExp - remainder);
            gainedExp = expGain(baseExp, currentLevel, levelInputB);

            // Log the state for debugging
            console.log(`Level: ${currentLevel}, EVMultiplier: ${EVMultiplier}, RemainingExp: ${remainingExp}, GainedExp: ${gainedExp}`);
        } else if (currentLevel == levelCap) {
            EVMultiplier += Math.floor((expLookup(growthRate, currentLevel) - finalExp) / gainedExp);
            control = false;
        }
    }

    return EVs.map(element => element * EVMultiplier);
}

calculateBtn.addEventListener("click", function () {
    pokemonInputA = document.querySelector('#pokemonInputA').value
    pokemonInputB = document.querySelector('#pokemonInputB').value
    levelInputA = document.querySelector('#levelInputA').value
    levelInputB = document.querySelector('#levelInputB').value
    initialExp = document.querySelector('#initialExp').value
    finalExp = document.querySelector('#finalExp').value
    levelCap = document.querySelector('#levelCap').value
    let baseExpEVs = yieldLookup(pokemonInputB); 
    let growth_rate = growthLookup(pokemonInputA).trim();

    let baseEVs = baseExpEVs.slice(1);
    let baseExp = baseExpEVs[0];

    console.log(EVGain(baseEVs, baseExp, levelInputA, levelInputB, initialExp, finalExp, levelCap, growth_rate));
})


//Load all selectable pokemon into an array
