function extractFieldsFromQuery(query) {
  const fieldRegex = /(\b[a-zA-Z_]+\b)(?=\s+(?:Contains Anycase|contains:anycase|contains|equals|matches|etc))/gi;
  const matches = query.matchAll(fieldRegex);
  const fields = new Set();

  for (const match of matches) {
    fields.add(match[0]);
  }

  return Array.from(fields);
}

function findMissingFields(inputFields) {
  const missingFields = [];
  const lowerCaseFieldMap = {};

  Object.keys(fieldMap).forEach(key => {
    lowerCaseFieldMap[key.toLowerCase()] = true;
  });

  for (const field of inputFields) {
    if (!lowerCaseFieldMap[field.toLowerCase()]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

function wrapConditionsWithBraces(query) {
  const logicalOpsRegex = /\s+(AND|OR)\s+/gi;
  const splitParts = query.split(logicalOpsRegex);
  let result = "";
  for (let i = 0; i < splitParts.length; i++) {
    const part = splitParts[i].trim();
    if (part.toUpperCase() === "AND" || part.toUpperCase() === "OR") {
      result += ` ${part} `;
    } else {
      result += `(${part})`;
    }
  }
  return `(${result})`;
}

function convertDoubleQuotesToSingle(query) {
  return query.replace(/"([^"]*?)"/g, (_, val) => `'${val}'`);
}

function convertQuery() {
  const input = document.getElementById("input").value.trim();

  if (!input) {
    alert("Please enter a query to convert");
    return;
  }

  const inputFields = extractFieldsFromQuery(input);
  const missingFields = findMissingFields(inputFields);

  if (missingFields.length > 0) {
    showErrorPopup(missingFields);
    return;
  }

  let output = input;
  output = output.replace(/Contains Anycase/gi, 'contains:anycase');

  Object.entries(fieldMap).forEach(([legacyField, newField]) => {
    const regex = new RegExp("\\b" + legacyField + "\\b", "gi");
    output = output.replace(regex, newField);
  });

  const logicOps = (output.match(/\b(AND|OR)\b/gi) || []).length;
  if (logicOps > 1) {
    output = wrapConditionsWithBraces(output);
  }

  output = convertDoubleQuotesToSingle(output);

  document.getElementById("output").value = output;
}

function showErrorPopup(missingFields) {
  const popup = document.getElementById("errorPopup");
  const missingFieldsContainer = document.getElementById("missingFields");

  if (!missingFields || missingFields.length === 0) {
    popup.classList.remove("show");
    return;
  }

  missingFieldsContainer.innerHTML = missingFields
    .map(field => `<div class="error-field">${field}</div>`)
    .join('');

  popup.classList.add("show");
}

function closeErrorPopup() {
  document.getElementById("errorPopup").classList.remove("show");
}

function copyMissingFields() {
  const missingFields = Array.from(
    document.querySelectorAll("#missingFields .error-field")
  ).map(el => el.textContent).join('\n');

  navigator.clipboard.writeText(missingFields).then(() => {
    const popup = document.getElementById("popup");
    popup.textContent = "Copied missing fields to clipboard!";
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 2000);
  });
}

function copyOutput() {
  const outputText = document.getElementById("output");
  outputText.select();
  document.execCommand("copy");

  const popup = document.getElementById("popup");
  popup.textContent = "Copied to clipboard!";
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

function copyInput() {
  const inputText = document.getElementById("input");
  inputText.select();
  document.execCommand("copy");

  const popup = document.getElementById("popup");
  popup.textContent = "Copied to clipboard!";
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

function clearInput() {
  document.getElementById("input").value = "";
}

function clearOutput() {
  document.getElementById("output").value = "";
}
