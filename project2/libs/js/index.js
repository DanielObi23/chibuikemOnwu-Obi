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


// GET ALL FUNCTIONS
function getAllPersonnel() {
  makeGetRequest("getAllPersonnel", (result) => {
    const personnelData = result.data;
    const table = $('#personnelTableBody');
    table.empty();
    personnelData.forEach((personnel) => {
      table.append(`
        <tr>
          <td class="align-middle text-nowrap">
            ${personnel.lastName}, ${personnel.firstName}
          </td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">
            ${personnel.department}
          </td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">
            ${personnel.location}
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
  })
}

function getAllDepartments() {
  makeGetRequest("getAllDepartments", (result) => {
    const departmentData = result.data;
    const table = $('#departmentTableBody');
    table.empty();
    departmentData.forEach((department) => {
      table.append(`
        <tr>
          <td class="align-middle text-nowrap">
            ${department.name}
          </td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">
            ${department.locationName}
          </td>
          <td class="align-middle text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr> 
      `);
    })
  })
}

function getAllLocations() {
  makeGetRequest("getAllLocations", (result) => {
    const locationData = result.data;
    const table = $('#locationTableBody');
    table.empty();
    locationData.forEach((location) => {
      table.append(`
        <tr>
          <td class="align-middle text-nowrap">
            ${location.name}
          </td>
          <td class="align-middle text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${location.id}">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
      `);
    })
  })    
}

getAllPersonnel() // On load, only the personnel page is shown, so this is query only for personnel page

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

// REFRESH BUTTON
$("#refreshBtn").click(function () {

  if ($("#personnelBtn").hasClass("active")) {
    getAllPersonnel()      
  } else if ($("#departmentsBtn").hasClass("active")) {
    getAllDepartments()
  } else {
    getAllLocations()
  }
  
});

// FILTER BUTTON
$("#filterBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#filterModal").modal("show");
    makeGetRequest("getAllFilterOptions", (result) => {
      // Populating filter department select
      $("#filterPersonnelDepartment").html("");
      $("#filterPersonnelDepartment").append(
        "<option value=''>Filter By Department</option>"
      );
      $.each(result.data.department, function () {
        $("#filterPersonnelDepartment").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });

      // Populating filter location select
      $("#filterDepartmentLocations").html("");
      $("#filterDepartmentLocations").append(
        "<option value=''>Filter By Location</option>"
      );
      $.each(result.data.location, function () {
        $("#filterDepartmentLocations").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });
    })     
  } else {
    console.log("no filtering")
  }
});

$("#filterForm").on("submit", function (e) {
  e.preventDefault();
  $('#filterBtn').focus();
  const data = {
    "department": $("#filterPersonnelDepartment").val(),
    "location": $("#filterDepartmentLocations").val()
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
        personnelData.forEach((personnel) => {
          table.append(`
            <tr>
              <td class="align-middle text-nowrap">
                ${personnel.lastName}, ${personnel.firstName}
              </td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${personnel.department}
              </td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${personnel.location}
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
      }
      
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});

// ADD BUTTON
$("#addBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#addPersonnelModal").modal("show")
    makeGetRequest("getAllFilterOptions", (result) => {
      $("#addPersonnelFirstName").val("");
      $("#addPersonnelLastName").val("");
      $("#addPersonnelEmailAddress").val("");
      $("#addPersonnelJobTitle").val("")
      $.each(result.data.department, function () {
        $("#addPersonnelDepartment").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });
    })    
  } else if ($("#departmentsBtn").hasClass("active")) {
    $("#addDepartmentModal").modal("show")
    makeGetRequest("getAllFilterOptions", (result) => {
      $("#addDepartmentName").val("");
      $.each(result.data.location, function () {
        $("#addDepartmentLocations").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });
    })   

  } else {
    $("#addLocationModal").modal("show")
    $("#addLocationName").val("");
  }    
});


// PERSONNEL SECTION
$("#personnelBtn").click(getAllPersonnel);

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
      getAllPersonnel()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});

$("#addPersonnelForm").on("submit", function (e) {
  e.preventDefault();
  const data = {
    "firstName": $("#addPersonnelFirstName").val(),
    "lastName": $("#addPersonnelLastName").val(),
    "email": $("#addPersonnelEmailAddress").val(),
    "jobTitle": $("#addPersonnelJobTitle").val(),
    "departmentID": $("#addPersonnelDepartment").val()
  }
  makePostRequest("addPersonnel", "#addPersonnelModal", data, (result) => {
    if (result.status.code === "200") {
      getAllPersonnel()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});

$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  $("#deletePersonnelEmployeeID").val($(e.relatedTarget).attr("data-id")); 
});

$("#deletePersonnelForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deletePersonnelByID", $("#deletePersonnelEmployeeID").val(), (result) => {
    if (result.status.code === "200") {
      getAllPersonnel()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});


// DEPARTMENT SECTION
$("#departmentsBtn").click(getAllDepartments);

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
      console.log(result.status.description)
      console.log("edit")
      getAllDepartments()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
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
      console.log(result.status.description)
      getAllDepartments()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});

$("#deleteDepartmentModal").on("show.bs.modal", function (e) {
  $("#deleteDepartmentID").val($(e.relatedTarget).attr("data-id")); 
});

$("#deleteDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deleteDepartmentByID", $("#deleteDepartmentID").val(), (result) => {
    if (result.status.code === "200") {
      console.log(result.status.description)
      getAllDepartments()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      alert(result.status.description)
    }
  })
  
});


// LOCATION SECTION
$("#locationsBtn").click(getAllLocations);

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
      console.log(result.status.description)
      getAllLocations()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
});

$("#addLocationForm").on("submit", function (e) {
  e.preventDefault();
  $('#addBtn').focus();
  const data = {
    "name": $("#addLocationName").val(),
  }
  makePostRequest("addLocation", "#addLocationModal", data, (result) => {
    if (result.status.code === "200") {
      console.log(result.status.description)
      getAllLocations()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      console.log(result.status.description)
    }
  })
  
});

$("#deleteLocationModal").on("show.bs.modal", function (e) {
  $("#deleteLocationID").val($(e.relatedTarget).attr("data-id")); 
});

$("#deleteLocationForm").on("submit", function (e) {
  e.preventDefault();
  makeDeleteRequest("deleteLocationByID", $("#deleteLocationID").val(), (result) => {
    if (result.status.code === "200") {
      console.log(result.status.description)
      getAllLocations()
    } else if (result.status.code === "300") {
      console.log(result.status.description)
    } else {
      alert(result.status.description)
    }
  })
  
});