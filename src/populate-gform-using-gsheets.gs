/**
 * Auto-populate Question options in Google Forms
 * from values in Google Spreadsheet
 * inspired by Amit Agarwal (https://www.labnol.org/code/google-forms-choices-from-sheets-200630)
 *
 * for the script to work there must be a column named 'FormID' and has a value of Google Form ID(s) as its row
 * within the same sheet as the data and then execute the script from the sheet containing the data
 **/
const populateGoogleForms = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const [header, ...data] = SpreadsheetApp.getActiveSheet().getDataRange().getDisplayValues();

  let options = {};
  header.forEach((title, i) => {
    if ('' !== title) {
      options[title] = [...new Set(data.map(d => d[i]).filter(e => e))];
    }
  });

  const FORMS_ID = options['FormID'];
  if (!FORMS_ID || FORMS_ID.length == 0) {
    ss.toast("Please provide the list of Google Form ID to be updated as value for the column with name 'FormID'")
    return;
  }

  FORMS_ID.forEach(id => {
    try {
      FormApp.openById(id)
      .getItems()
      .map((item) => ({item, values: options[item.getTitle()]}))
      .filter(({ values }) => values)
      .forEach(({ item, values }) => {
        switch (item.getType()) {
          case FormApp.ItemType.CHECKBOX:
            item.asCheckboxItem().setChoiceValues(values);
            break;
          case FormApp.ItemType.LIST:
            item.asListItem().setChoiceValues(values);
            break;
          case FormApp.ItemType.MULTIPLE_CHOICE:
            item.asMultipleChoiceItem().setChoiceValues(values);
            break;
          default:
          // ignore item
        }
      });
    } catch(error) {
      console.log('Got an Error when Processing Form with ID', id, error);
      ss.toast('Failed to update Form with ID ' + id)
    }
  });

  ss.toast('Google Form(s) Updated');
};
