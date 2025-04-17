function makeAjaxRequest(name, successCallback) {
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


$("#searchInp").on("keyup", function () {
  
    // your code
    
  });
  
  $("#refreshBtn").click(function () {
    
    if ($("#personnelBtn").hasClass("active")) {
      
      // Refresh personnel table
      
    } else {
      
      if ($("#departmentsBtn").hasClass("active")) {
        
        // Refresh department table
        
      } else {
        
        // Refresh location table
        
      }
      
    }
    
  });
  
  $("#filterBtn").click(function () {
    
    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
    
  });
  
  $("#addBtn").click(function () {
    
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    
  });
  
  $("#personnelBtn").click(function () {
    makeAjaxRequest("getAll", function(result) {
      const personnelData = result.data;
      console.log(personnelData)
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
  });
  
  $("#departmentsBtn").click(function () {
    makeAjaxRequest("getAllDepartments", function(result) {
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
              <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr> 
        `);
      })
    })
  });
  
  $("#locationsBtn").click(function () {
    makeAjaxRequest("getAllLocations", function(result) {
      const locationData = result.data;
      console.log(locationData)
      const table = $('#locationTableBody');
      table.empty();
      locationData.forEach((location) => {
        table.append(`
          <tr>
            <td class="align-middle text-nowrap">
              ${location.name}
            </td>
            <td class="align-middle text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
      })
    })    
  });
  
  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    
    $.ajax({
      url:
        "https://resources.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        // Retrieve the data-id attribute from the calling button
        // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
        // for the non-jQuery JavaScript alternative
        id: $(e.relatedTarget).attr("data-id") 
      },
      success: function (result) {
        var resultCode = result.status.code;
  
        if (resultCode == 200) {
          
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
  
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
          
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });
  
  // Executes when the form button with type="submit" is clicked
  
  $("#editPersonnelForm").on("submit", function (e) {
    
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
  
    e.preventDefault();
  
    // AJAX call to save form data
    
  });
  