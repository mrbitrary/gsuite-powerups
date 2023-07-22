/**
 * Auto-populate Question options in Google Forms
 * from values in Google Spreadsheet
 * inspired by Amit Agarwal (https://www.labnol.org/code/google-forms-choices-from-sheets-200630)
 *
 * for the script to work there must be a column named 'FormID' and has a value of Google Form ID(s) as its row
 * within the same sheet as the data and then execute the script from the sheet containing the data.
 * or you can use the prmopt and provide the GForm ID
 **/
const onOpen = () => { // eslint-disable-line no-unused-vars
  const ui = SpreadsheetApp.getUi() // eslint-disable-line no-undef
  ui.createMenu('Powerups')
    .addItem('Populate GForm (with prompt)', 'populateGFormWithPrompt')
    .addItem('Populate GForm (with FormID Column)', 'populateGoogleForms')
    .addToUi()
}

const ss = SpreadsheetApp.getActiveSpreadsheet() // eslint-disable-line no-undef

const getPredefinedOptions = () => { // eslint-disable-line no-unused-vars
  const [header, ...data] = SpreadsheetApp.getActiveSheet().getDataRange().getDisplayValues() // eslint-disable-line no-undef
  const options = {}
  header.forEach((title, i) => {
    if (title !== '') {
      options[title] = [...new Set(data.map(d => d[i]).filter(e => e))]
    }
  })

  return options
}

const populateOptions = (formId, options) => { // eslint-disable-line no-unused-vars
  try {
    FormApp.openById(formId) // eslint-disable-line no-undef
      .getItems()
      .map((item) => ({ item, values: options[item.getTitle()] }))
      .filter(({ values }) => values)
      .forEach(({ item, values }) => {
        switch (item.getType()) {
          case FormApp.ItemType.CHECKBOX: // eslint-disable-line no-undef
            item.asCheckboxItem().setChoiceValues(values)
            break
          case FormApp.ItemType.LIST: // eslint-disable-line no-undef
            item.asListItem().setChoiceValues(values)
            break
          case FormApp.ItemType.MULTIPLE_CHOICE: // eslint-disable-line no-undef
            item.asMultipleChoiceItem().setChoiceValues(values)
            break
          default:
          // ignore item
        }
      })

    ss.toast('GForm has been updated')
  } catch (error) {
    console.log('Got an Error when Processing Form with ID', formId, error)
    ss.toast('Failed to update GForm with ID ' + formId)
  }
}

const populateGFormWithPrompt = () => { // eslint-disable-line no-unused-vars
  const ui = SpreadsheetApp.getUi() // eslint-disable-line no-undef
  const response = ui.prompt('Enter the GForm ID', ui.ButtonSet.OK_CANCEL)
  if (ui.Button.OK === response.getSelectedButton()) {
    populateOptions(response.getResponseText(), getPredefinedOptions())
  } else {
    console.log('User has close the prompt')
  }
}

const populateGoogleForms = () => { // eslint-disable-line no-unused-vars
  const options = getPredefinedOptions()

  const FORMS_ID = options.FormID
  if (!FORMS_ID || FORMS_ID.length === 0) {
    ss.toast("Please provide the list of Google Form ID to be updated as value for the column with name 'FormID'")
    return
  }

  FORMS_ID.forEach(id => {
    populateOptions(id, options)
  })

  ss.toast('Google Form(s) Updated')
}
