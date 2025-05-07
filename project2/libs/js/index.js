// REQUEST FUNCTIONS
function makeGetRequest(name, successCallback) {
  $.ajax({
    url: `libs/php/${name}.php`,
    type: 'GET',
    success: function(result) {
      successCallback(result);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error with data: " + textStatus);
      console.log("Response text:", jqXHR.responseText);
      console.log("Status:", jqXHR.status);
      console.log("Error thrown:", errorThrown);
    }
  })
}

function makePostRequest(name,modalID, data, successCallback) {
  $.ajax({
    url: `libs/php/${name}.php`,
    type: 'POST',
    dataType: 'json',
    data: data,
    success: function(result) {
      if (result.status.code == 200) {
        successCallback(result);        
      } else {
        $(`${modalID} .modal-title`).replaceWith(
          "Error updating data"
        );
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $(`${modalID} .modal-title`).replaceWith(
        "Error updating data"
      );
    }
  })
}

function makeDeleteRequest(name, id, successCallback) {
  $.ajax({
    url: `libs/php/${name}.php?id=${id}`,
    type: 'DELETE',
    dataType: 'json',
    success: function(result) {
      successCallback(result);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error with data: " + textStatus);
      console.log("Response text:", jqXHR.responseText);
      console.log("Status:", jqXHR.status);
      console.log("Error thrown:", errorThrown);
    }
  })
}

function personnelDataRows(personnelData) {
  const table = $('#personnelTableBody');
  table.empty();
  var frag = document.createDocumentFragment();
    personnelData.forEach(function(personnel) {
      var row = document.createElement("tr");
      
      // Name cell
      var nameCell = document.createElement("td");
      nameCell.classList = "align-middle text-nowrap";
      var nameText = document.createTextNode(`${personnel.lastName}, ${personnel.firstName}`);
      nameCell.append(nameText);
      row.append(nameCell);
      
      // Department cell
      var departmentCell = document.createElement("td");
      departmentCell.classList = "align-middle text-nowrap d-none d-md-table-cell";
      var departmentText = document.createTextNode(personnel.department);
      departmentCell.append(departmentText);
      row.append(departmentCell);
      
      // Location cell
      var locationCell = document.createElement("td");
      locationCell.classList = "align-middle text-nowrap d-none d-md-table-cell";
      var locationText = document.createTextNode(personnel.location);
      locationCell.append(locationText);
      row.append(locationCell);
      
      // Email cell
      var emailCell = document.createElement("td");
      emailCell.classList = "align-middle text-nowrap d-none d-md-table-cell";
      var emailText = document.createTextNode(personnel.email);
      emailCell.append(emailText);
      row.append(emailCell);
      
      // Actions cell
      var actionsCell = document.createElement("td");
      actionsCell.classList = "text-end text-nowrap";
      
      //Edit button
      var editButton = document.createElement("button");
      editButton.setAttribute("type", "button");
      editButton.classList = "btn btn-primary btn-sm";
      editButton.setAttribute("data-bs-toggle", "modal");
      editButton.setAttribute("data-bs-target", "#editPersonnelModal");
      editButton.setAttribute("data-id", personnel.id);
      
      // Edit icon
      var editIcon = document.createElement("i");
      editIcon.classList = "fa-solid fa-pencil fa-fw";
      editButton.append(editIcon);
      
      // Delete button
      var deleteButton = document.createElement("button");
      deleteButton.setAttribute("type", "button");
      deleteButton.classList = "btn btn-primary btn-sm";
      deleteButton.setAttribute("data-bs-toggle", "modal");
      deleteButton.setAttribute("data-bs-target", "#deletePersonnelModal");
      deleteButton.setAttribute("data-id", personnel.id);
      
      // Delete icon
      var deleteIcon = document.createElement("i");
      deleteIcon.classList = "fa-solid fa-trash fa-fw";
      deleteButton.append(deleteIcon);
      
      // Add buttons to actions cell
      actionsCell.append(editButton);
      actionsCell.append(" "); // Space between buttons
      actionsCell.append(deleteButton);

      row.append(actionsCell);
      frag.append(row);
    });
    table.append(frag);
}
// GET ALL FUNCTIONS
function getAllPersonnel() {
  makeGetRequest("getAllPersonnel", (result) => {
    const personnelData = result.data;
    personnelDataRows(personnelData)
  })
}

function getAllDepartments() {
  makeGetRequest("getAllDepartments", (result) => {
    const departmentData = result.data;
    const table = $('#departmentTableBody');
    table.empty();

    var frag = document.createDocumentFragment();
    departmentData.forEach(function(department) {
      var row = document.createElement("tr");
      
      // Department name cell
      var nameCell = document.createElement("td");
      nameCell.classList = "align-middle text-nowrap";
      var nameText = document.createTextNode(department.name);
      nameCell.append(nameText);
      row.append(nameCell);
      
      // Location name cell
      var locationCell = document.createElement("td");
      locationCell.classList = "align-middle text-nowrap d-none d-md-table-cell";
      var locationText = document.createTextNode(department.locationName);
      locationCell.append(locationText);
      row.append(locationCell);
      
      // Actions cell
      var actionsCell = document.createElement("td");
      actionsCell.classList = "align-middle text-end text-nowrap";
      
      // Edit button
      var editButton = document.createElement("button");
      editButton.setAttribute("type", "button");
      editButton.classList = "btn btn-primary btn-sm";
      editButton.setAttribute("data-bs-toggle", "modal");
      editButton.setAttribute("data-bs-target", "#editDepartmentModal");
      editButton.setAttribute("data-id", department.id);
      
      // Edit icon
      var editIcon = document.createElement("i");
      editIcon.classList = "fa-solid fa-pencil fa-fw";
      editButton.append(editIcon);
      
      // Delete button
      var deleteButton = document.createElement("button");
      deleteButton.setAttribute("type", "button");
      deleteButton.classList = "btn btn-primary btn-sm deleteDepartmentBtn";
      deleteButton.setAttribute("data-bs-target", "#deleteDepartmentModal");
      deleteButton.setAttribute("data-id", department.id);
      
      // Delete icon
      var deleteIcon = document.createElement("i");
      deleteIcon.classList = "fa-solid fa-trash fa-fw";
      deleteButton.append(deleteIcon);
      
      // Add buttons to actions cell
      actionsCell.append(editButton);
      actionsCell.append(" "); // Space between buttons
      actionsCell.append(deleteButton);
      
      row.append(actionsCell);
      frag.append(row);
    });
    table.append(frag);
  })
}

function getAllLocations() {       
          
  makeGetRequest("getAllLocations", (result) => {
    const locationData = result.data;
    const table = $('#locationTableBody');
    table.empty();
    var frag = document.createDocumentFragment();
    result.data.forEach(function(location, index) {
      var row = document.createElement("tr");
                  
      // Location name cell
      var nameCell = document.createElement("td");
      nameCell.classList = "align-middle text-nowrap";
      var locationName = document.createTextNode(location.name);
      nameCell.append(locationName);
      row.append(nameCell);

      var actionsCell = document.createElement("td");
      actionsCell.classList = "align-middle text-end text-nowrap";
      
      // Edit button
      var editButton = document.createElement("button");
      editButton.classList = "btn btn-primary btn-sm";
      editButton.setAttribute("type", "button");
      editButton.setAttribute("data-bs-toggle", "modal");
      editButton.setAttribute("data-bs-target", "#editLocationModal");
      editButton.setAttribute("data-id", location.id);
      
      // Edit icon
      var editIcon = document.createElement("i");
      editIcon.classList = "fa-solid fa-pencil fa-fw";
      editButton.append(editIcon);
      
      // Delete button
      var deleteButton = document.createElement("button");
      deleteButton.classList = "btn btn-primary btn-sm deleteLocationBtn";
      deleteButton.setAttribute("type", "button");
      deleteButton.setAttribute("data-id", location.id);
      
      // Delete icon
      var deleteIcon = document.createElement("i");
      deleteIcon.classList = "fa-solid fa-trash fa-fw";
      deleteButton.append(deleteIcon);
      
      // Add buttons to the actions cell
      actionsCell.append(editButton);
      actionsCell.append(" "); // Space between buttons
      actionsCell.append(deleteButton);
      
      row.append(actionsCell);
      frag.append(row);
    });    
  
    table.append(frag);
  })    
}

getAllPersonnel() // On load, only the personnel page is shown, so this is query only for personnel page

// TOAST 
function errorToast(message) {
  $("#error-toast-text").html(message)
  $("#errorToast").toast("show")
}

function successToast(message) {
  $("#success-toast-text").html(message)
  $("#successToast").toast("show")
}


// SEARCH FUNCTIONALITY
$("#searchInp").on("keyup", function () {
  if ($("#personnelBtn").hasClass("active")) {
    const search = $("#searchInp").val();
    const data = {
      "txt": search
    }
    makePostRequest("SearchAll", "#addPersonnelModal", data, (result) => {
      if (result.status.code === "200") {
        const foundPersonnel = result.data.found;
        const table = $('#personnelTableBody');
        table.empty();
        foundPersonnel.forEach((personnel) => {
          table.append(`
            <tr>
              <td class="align-middle text-nowrap">
                ${personnel.lastName}, ${personnel.firstName}
              </td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${personnel.departmentName}
              </td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${personnel.locationName}
              </td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${personnel.email}
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${personnel.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${personnel.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `);
        })
      } else if (result.status.code === "300") {
        console.log(result.status.description)
      } else {
        console.log(result.status.description)
      }
    })     
  } 
});

// FILTER BUTTON
let filteredLocationID = 0;
let filteredDepartmentID = 0;

$("#filterBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#filterModal").modal("show");
  }
});

$("#filterModal").on("show.bs.modal", function () {
  makeGetRequest("getAllFilterOptions", (result) => {
    // Populating filter department select
    $("#filterPersonnelDepartment").html("");
    $("#filterPersonnelDepartment").append(
      "<option value='0'>All Departments</option>"
    );
    $.each(result.data.department, function () {
      $("#filterPersonnelDepartment").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });
    $("#filterPersonnelDepartment").val(filteredDepartmentID).trigger('change');

    // Populating filter location select
    $("#filterDepartmentLocations").html("");
    $("#filterDepartmentLocations").append(
      "<option value='0'>All Locations</option>"
    );
    $.each(result.data.location, function () {
      $("#filterDepartmentLocations").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });
    $("#filterDepartmentLocations").val(filteredLocationID).trigger('change');
  })     
});

$("#filterPersonnelDepartment").change(function () {
  if (this.value > 0) {
    filteredLocationID = 0
    filteredDepartmentID = this.value
    $("#filterDepartmentLocations").val(0);
    const data = {
      "department": filteredDepartmentID,
      "location":  filteredLocationID
    }

    makePostRequest("filterPersonnel", "#filterModal", data, (result) => {
      if (result.status.code === "200") {
        const personnelData = result.data;
        const table = $('#personnelTableBody');
        table.empty();
        if (personnelData.length === 0) {
          table.append(`
            <tr>
              <td colspan="4" class="align-middle text-nowrap d-none d-md-table-cell text-center">
                THERE ARE NO PERSONNEL MATCHING THAT DESCRIPTION
              </td>
            </tr>
          `);
        } else {
          personnelDataRows(personnelData) 
        }
        
      } else if (result.status.code === "300") {
        console.log(result.status.description)
      } else {
        console.log(result.status.description)
      }
    }) 
  } else {
    filteredDepartmentID = 0
    if (filteredDepartmentID == 0 && filteredLocationID == 0) {
      getAllPersonnel()
    }
  }
})

$("#filterDepartmentLocations").change(function () {
  if (this.value > 0) {
    filteredLocationID = this.value
    filteredDepartmentID = 0
    $("#filterPersonnelDepartment").val(0);
    const data = {
      "department": filteredDepartmentID,
      "location":  filteredLocationID
    }
    
    makePostRequest("filterPersonnel", "#filterModal", data, (result) => {
      if (result.status.code === "200") {
        const personnelData = result.data;
        if (personnelData.length === 0) {
          const table = $('#personnelTableBody');
          table.empty();
          table.append(`
            <tr>
              <td colspan="4" class="align-middle text-nowrap d-none d-md-table-cell text-center">
                THERE ARE NO PERSONNEL MATCHING THAT DESCRIPTION
              </td>
            </tr>
          `);
        } else {
          personnelDataRows(personnelData) 
        }
        
      } else if (result.status.code === "300") {
        console.log(result.status.description)
      } else {
        console.log(result.status.description)
      }
    }) 
  } else {
    filteredLocationID = 0
    if (filteredDepartmentID == 0 && filteredLocationID == 0) {
      getAllPersonnel()
    }
  }
})

// REFRESH BUTTON
$("#refreshBtn").click(function () {
  const message = "Personnel table was successsful refreshed"
  if (filteredLocationID == 0 && filteredDepartmentID == 0) {
    if ($("#personnelBtn").hasClass("active")) {
      $("#searchInp").val("")
      getAllPersonnel()      
    } else if ($("#departmentsBtn").hasClass("active")) {
      $("#searchInp").val("")
      getAllDepartments()
    } else {
      $("#searchInp").val("")
      getAllLocations()
    }
    successToast(message)
  } else if (filteredDepartmentID > 0) {
      const data = {
        "department": filteredDepartmentID,
        "location":  filteredLocationID
      }

      makePostRequest("filterPersonnel", "#filterModal", data, (result) => {
        if (result.status.code === "200") {
          const personnelData = result.data;
          const table = $('#personnelTableBody');
          table.empty();
          if (personnelData.length === 0) {
            table.append(`
              <tr>
                <td colspan="4" class="align-middle text-nowrap d-none d-md-table-cell text-center">
                  THERE ARE NO PERSONNEL MATCHING THAT DESCRIPTION
                </td>
              </tr>
            `);
          } else {
            personnelDataRows(personnelData) 
          }
          
        } else if (result.status.code === "300") {
          console.log(result.status.description)
        } else {
          console.log(result.status.description)
        }
      })
      successToast(message)
  } else {
      const data = {
        "department": filteredDepartmentID,
        "location":  filteredLocationID
      }
      
      makePostRequest("filterPersonnel", "#filterModal", data, (result) => {
        if (result.status.code === "200") {
          const personnelData = result.data;
          if (personnelData.length === 0) {
            const table = $('#personnelTableBody');
            table.empty();
            table.append(`
              <tr>
                <td colspan="4" class="align-middle text-nowrap d-none d-md-table-cell text-center">
                  THERE ARE NO PERSONNEL MATCHING THAT DESCRIPTION
                </td>
              </tr>
            `);
          } else {
            personnelDataRows(personnelData) 
          }
          
        } else if (result.status.code === "300") {
          console.log(result.status.description)
        } else {
          console.log(result.status.description)
        }
      })
      successToast(message)
  }
  
});

// ADD BUTTON
$("#addBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#addPersonnelModal").modal("show")
  } else if ($("#departmentsBtn").hasClass("active")) {
    $("#addDepartmentModal").modal("show")
  } else {
    $("#addLocationModal").modal("show")
  }    
});


// PERSONNEL SECTION
$("#personnelBtn").click(() => {
  getAllPersonnel(); 
  $("#filterBtn").attr("disabled", false);
  $("#searchInp").attr("disabled", false);
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  const data = {
    id: $(e.relatedTarget).attr("data-id") 
  }
  makePostRequest("getPersonnelByID", "#editPersonnelModal", data, (result) => {
    $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

    $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
    $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
    $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
    $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

    $("#editPersonnelDepartment").html("");

    $.each(result.data.department, function () {
      $("#editPersonnelDepartment").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });

    $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
  })
});

$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault();
  const data = {
    "id": $("#editPersonnelEmployeeID").val(),
    "firstName": $("#editPersonnelFirstName").val(),
    "lastName": $("#editPersonnelLastName").val(),
    "email": $("#editPersonnelEmailAddress").val(),
    "jobTitle": $("#editPersonnelJobTitle").val(),
    "departmentID": $("#editPersonnelDepartment").val(),
  }
  makePostRequest("editPersonnel", "#editPersonnelModal", data, (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllPersonnel()
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
  $("#editPersonnelModal").modal("hide")
});

$("#addPersonnelModal").on("show.bs.modal", function (e) {
  makeGetRequest("getAllFilterOptions", (result) => {
    $("#addPersonnelFirstName").val("");
    $("#addPersonnelLastName").val("");
    $("#addPersonnelEmailAddress").val("");
    $("#addPersonnelJobTitle").val("")
    $("#addPersonnelDepartment").html("")
    $.each(result.data.department, function () {
      $("#addPersonnelDepartment").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });
  })    
});

$("#addPersonnelForm").on("submit", function (e) {
  e.preventDefault();
  const firstName = $("#addPersonnelFirstName").val();
  const lastName = $("#addPersonnelLastName").val()
  const email = $("#addPersonnelEmailAddress").val()
  const jobTitle = $("#addPersonnelJobTitle").val()
  const departmentID = $("#addPersonnelDepartment").val()
  if (firstName.length > 0 &&
     lastName.length > 0 &&
     email.length > 0 && 
     jobTitle.length > 0 && 
     departmentID.length > 0) {
      const data = {
        firstName,
        lastName,
        email,
        jobTitle,
        departmentID
      }
      makePostRequest("addPersonnel", "#addPersonnelModal", data, (result) => {
        if (result.status.code === "200") {
          successToast(result.status.description)
          getAllPersonnel()
        } else if (result.status.code === "300") {
          errorToast(result.status.description)
        } else {
          errorToast(result.status.description)
        }
      })
      $("#addPersonnelModal").modal("hide")
  } else {
    return
  }
  
});

$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  $("#deletePersonnelEmployeeID").val($(e.relatedTarget).attr("data-id")); 
  const data = {
    id: $(e.relatedTarget).attr("data-id") 
  }
  makePostRequest("getPersonnelByID", "#deletePersonnelModal", data, (result) => {
    $("#deletePersonnelFirstName").html(result.data.personnel[0].firstName);
    $("#deletePersonnelLastName").html(result.data.personnel[0].lastName);
  })
});

$("#deletePersonnelForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deletePersonnelByID", $("#deletePersonnelEmployeeID").val(), (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllPersonnel()
      $("#deletePersonnelModal").modal("hide")
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
    
});


// DEPARTMENT SECTION
$("#departmentsBtn").click(() => {
  getAllDepartments(); 
  $("#filterBtn").attr("disabled", true);
  $("#searchInp").attr("disabled", true);
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  const data = {
    id: $(e.relatedTarget).attr("data-id") 
  }
  makePostRequest("getDepartmentByID", "#editDepartmentModal", data, (result) => {
    $("#editDepartmentID").val(result.data.department[0].id);
    $("#editDepartmentName").val(result.data.department[0].name);
    $("#editDepartmentLocations").html("");

    $.each(result.data.location, function () {
      $("#editDepartmentLocations").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });

    $("#editDepartmentLocations").val(result.data.department[0].locationID);
  })
});

$("#editDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  const data = {
    "id": $("#editDepartmentID").val(),
    "name": $("#editDepartmentName").val(),
    "locationID": $("#editDepartmentLocations").val(),
  }
  makePostRequest("editDepartment", "#editDepartmentModal", data, (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllDepartments()
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
    $("#editDepartmentModal").modal("hide")
  })
  
});

$("#addDepartmentModal").on("show.bs.modal", function (e) {
  makeGetRequest("getAllFilterOptions", (result) => {
    $("#addDepartmentName").val("");
    $("#addDepartmentLocations").empty()
    $.each(result.data.location, function () {
      $("#addDepartmentLocations").append(
        $("<option>", {
          value: this.id,
          text: this.name
        })
      );
    });
  })   
});

$("#addDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  $('#addBtn').focus();
  const data = {
    "name": $("#addDepartmentName").val(),
    "locationID": $("#addDepartmentLocations").val(),
  }
  makePostRequest("addDepartment", "#addDepartmentModal", data, (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllDepartments()
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
  $("#addDepartmentModal").modal("hide")
});

$(document).on("click", ".deleteDepartmentBtn", function (e) {
  $("#deleteDepartmentID").val($(this).data("id")); 
  // check if location can be deleted
  makeDeleteRequest("checkDeleteDepartment", $("#deleteDepartmentID").val(), (result) => {
    if (result.status.code === "409") {
      $("#cantDeleteDeptName").html(result.data.name)
      $("#personnelCount").html(result.data.personnelCount)
      $("#cantDeleteDepartmentModal").modal("show")
    } else {
      const data = {
        id:  $(this).data("id") 
      }
      makePostRequest("getDepartmentByID", "#deleteDepartmentModal", data, (result) => {
        $("#deleteDepartmentName").html(result.data.department[0].name);
      })
      $("#deleteDepartmentModal").modal("show")
    }
  })
});

$("#deleteDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deleteDepartmentByID", $("#deleteDepartmentID").val(), (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllDepartments()
      $("#deleteDepartmentModal").modal("hide")
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
  
});


// LOCATION SECTION
$("#locationsBtn").click(() => {
  getAllLocations(); 
  $("#filterBtn").attr("disabled", true);
  $("#searchInp").attr("disabled", true);
});

$("#editLocationModal").on("show.bs.modal", function (e) {
  const data = {
    id: $(e.relatedTarget).attr("data-id") 
  }
  makePostRequest("getLocationByID", "#editLocationModal", data, (result) => {
    $("#editLocationID").val(result.data[0].id);
    $("#editLocationName").val(result.data[0].name);
  })
});

$("#editLocationForm").on("submit", function (e) {
  e.preventDefault();
  const data = {
    "id": $("#editLocationID").val(),
    "name": $("#editLocationName").val()
  }
  makePostRequest("editLocation", "#editLocationModal", data, (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllLocations()
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
  $("#editLocationModal").modal("hide")
});

$("#addLocationModal").on("show.bs.modal", function (e) {
  $("#addLocationName").val("");
});

$("#addLocationForm").on("submit", function (e) {
  e.preventDefault();
  $('#addBtn').focus();
  const data = {
    "name": $("#addLocationName").val(),
  }
  makePostRequest("addLocation", "#addLocationModal", data, (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllLocations()
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })
  $("#addLocationModal").modal("hide")
});

$(document).on("click", ".deleteLocationBtn", function (e) {
  $("#deleteLocationID").val($(this).data("id")); 

  // check if location can be deleted
  makeDeleteRequest("checkDeleteLocation", $("#deleteLocationID").val(), (result) => {
    if (result.status.code === "409") {
      $("#cantDeleteLocName").html(result.data.name)
      $("#departmentCount").html(result.data.departmentCount)
      $("#cantDeleteLocationModal").modal("show")
    } else {
      const data = {
        id:  $(this).data("id") 
      }
      makePostRequest("getLocationByID", "#deleteLocationModal", data, (result) => {
        $("#deleteLocationName").html(result.data[0].name);
      })
      $("#deleteLocationModal").modal("show")
    }
  })
});

$("#deleteLocationForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deleteLocationByID", $("#deleteLocationID").val(), (result) => {
    if (result.status.code === "200") {
      successToast(result.status.description)
      getAllLocations()
      $("#deleteLocationModal").modal("hide")
    } else if (result.status.code === "300") {
      errorToast(result.status.description)
    } else {
      errorToast(result.status.description)
    }
  })  
});