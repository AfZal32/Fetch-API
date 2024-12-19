const container = document.getElementById("titles");
const spinner = document.getElementById("loading-spinner");
const requiredTitle = document.getElementById("required");
const requiredUpdate = document.getElementById("required-update");
const updatedTitleValue = document.getElementById("updated-title");
const searchButton = document.getElementById("button-search");
const searchValue = document.getElementById("input-value-search");
const searchedValues = document.getElementById("search-items");
const saveButton = document.getElementById("button-save");
const paginationControls = document.getElementById("pagination-controls");
let inputElement = document.getElementById("title-input");
let results = document.getElementById("search-result-lists");
let notFound = document.getElementById("not-found-info");
let filteredValues = [];
let titles = [];
let currentPage = 1;
const itemsPerPage = 5;

searchButton.disabled = true;

// Event listener for update modal for required*
updatedTitleValue.addEventListener("input", () => {
  if (updatedTitleValue.value.trim() === "" || inputElement.value) {
    requiredUpdate.style.display = "block";
    saveButton.disabled = true;
  } else {
    requiredUpdate.style.display = "none";
    saveButton.disabled = false;
  }
});

// Event listener to input felid for required

inputElement.addEventListener("input", () => {
  if (inputElement.value.trim() === "") {
    requiredTitle.style.display = "block";
  } else {
    requiredTitle.style.display = "none";
  }
});

// Event listener for search input

searchValue.addEventListener("input", () => {
  searchButton.disabled = false;
  if (searchValue.value.trim() === "") {
    notFound.innerHTML = "";
    searchButton.disabled = true;
    results.style.display = "none";
    container.style.display = "block";
    renderPage(currentPage);
    // genericRenderFunction(container, titles);
  }
});

searchValue.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchHandler();
    event.preventDefault();
  }
});

// Generic function for render titles
const genericRenderFunction = (containerShowTitles, titleValues) => {
  containerShowTitles.innerHTML = titleValues
    .map(
      (post, index) =>
        `
      <li>${index + 1}, ${
          post.title
        }<button class="button-title" onclick="deleteTitle(${
          post.id
        })"><i class="fa-solid fa-trash"></i></button>  <button class="button-title" onclick="updateTitle(${
          post.id
        })"><i class="fa-solid fa-pen-to-square"></i></button> <br></li>`
    )
    .join("");
};

// Function for render page
const renderPage = (page) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;
  const pageData = titles.slice(startIndex, endIndex);
  genericRenderFunction(container, pageData);
  renderPaginationControls();
};

const renderPaginationControls = () => {
  const totalPages = Math.ceil(titles.length / itemsPerPage);
  let controlsHTML = "";

  // Previous button
  controlsHTML += `<button ${
    currentPage === 1 ? "disabled" : ""
  } onclick = "changePage(currentPage - 1)" class = "button-success">Previous</button> `;

  //page number
  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button ${
      i === currentPage ? "class= 'active'" : ""
    } onclick="changePage(${i})" class = "button-success">${i}</button> `;
  }

  // Next button
  controlsHTML += `<button ${
    currentPage === totalPages ? "disabled" : ""
  } onclick = "changePage(currentPage + 1)" class = "button-success"> Next </button> `;

  paginationControls.innerHTML = controlsHTML;
};

const changePage = (page) => {
  const totalPages = Math.ceil(titles.length / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderPage(currentPage);
  }
};

// Generic function to  add event listeners
const genericEventAdd = (buttonName, functionCall) => {
  buttonName.addEventListener("click", functionCall);
};

//Generic function for search items
const genericSearchRenderFunction = () => {
  const flatResults = filteredValues.flat();
  const updatedResults = flatResults.filter((filteredValues) =>
    titles.some((titles) => filteredValues.id === titles.id)
  );
  genericRenderFunction(results, updatedResults);
  renderPage(currentPage);
};

// Generic function for update search items

const syncSearchItems = () => {
  results.innerHTML = "";
  const matchingTitles = [];

  titles.forEach((itemTitles) => {
    const matchingTitle = filteredValues.find(
      (itemResults) => itemResults.id === itemTitles.id
    );

    if (matchingTitle) {
      matchingTitle.title = itemTitles.title;
      matchingTitles.push(matchingTitle);
    }
  });
  if (matchingTitles.length > 0) {
    genericRenderFunction(results, matchingTitles);
    renderPage(currentPage);
  } else {
    results.innerHTML = ` <li> No matching titles found.</li>`;
  }
};
// Function for fetch api
const fetchApi = async () => {
  try {
    spinner.style.display = "flex";
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Slice out 10 data from response
    titles = data.slice(0, 10);
    renderPage(currentPage);
    // genericRenderFunction(container, titles);
  } catch (error) {
    console.error("error", error);
  } finally {
    spinner.style.display = "none";
  }
};

//function to add title
const buttonAdd = () => {
  const newTitle = inputElement.value.trim();
  const buttonOnSubmit = document.getElementById("button-add-title");
  const originalButton = buttonOnSubmit.innerHTML;
  buttonOnSubmit.innerHTML = `<span class="spinner"></span> Adding...`;
  buttonOnSubmit.disabled = true;

  //Set time out for fixed delay
  if (newTitle) {
    setTimeout(() => {
      const maxId =
        titles.length > 0 ? Math.max(...titles.map((item) => item.id)) : 0;
      const newPost = { id: maxId + 1, title: newTitle }; //value to object and push to global array
      titles.push(newPost);
      genericRenderFunction(container, titles);
      renderPage(currentPage);
      buttonOnSubmit.disabled = false;
      buttonOnSubmit.innerHTML = originalButton;
      inputElement.value = "";
    }, 2000);
  } else {
    requiredTitle.style.display = "block";
    buttonOnSubmit.disabled = false;
    buttonOnSubmit.innerHTML = originalButton;
  }
  if (newTitle.value) {
    requiredTitle.style.display = "none";
  }
};

// Function to delete title
const deleteTitle = (selectedId) => {
  const modalDelete = document.getElementById("container-delete-modal");
  const modalTitle = document.getElementById("title-to-delete");
  const deleteYesButton = document.getElementById("btn-delete-yes");
  const deleteNoButton = document.getElementById("btn-delete-no");

  // Generic function to modal style property
  const modalDisplayFunction = (styleProp) => {
    modalDelete.style.display = styleProp;
  };

  // Display the modal
  modalDisplayFunction("flex");
  modalTitle.innerHTML = titles?.find(({ id }) => id === selectedId).title;
  deleteYesButton.disabled = false;

  // Define the delete action
  const performDelete = () => {
    const originalBtn = deleteYesButton.innerHTML;
    deleteYesButton.innerHTML = `<span class="spinner"></span> Removing...`;
    deleteYesButton.style.cursor = "not-allowed";
    deleteYesButton.disabled = false;

    // Set timeout for fixed delay for delete title
    setTimeout(() => {
      titles = titles?.filter(({ id }) => id !== selectedId);
      genericRenderFunction(container, titles);
      const totalPages = Math.ceil(titles.length / itemsPerPage);
      currentPage = Math.min(currentPage, totalPages || 1); // Adjust page if last item was deleted
      renderPage(currentPage);
      deleteYesButton.disabled = true;
      deleteYesButton.style.cursor = "pointer";
      deleteYesButton.innerHTML = originalBtn;
      modalDisplayFunction("none");
      container.style.display = "block";
      genericSearchRenderFunction();
    }, 2000);

    // Remove event listeners after the action
    deleteYesButton.removeEventListener("click", performDelete);
    deleteNoButton.removeEventListener("click", closeModel);
    modalDelete.removeEventListener("click", closeModel);
  };

  // Define the close action
  const closeModel = () => {
    modalDisplayFunction("none");
    deleteYesButton.removeEventListener("click", performDelete);
    deleteNoButton.removeEventListener("click", closeModel);
    modalDelete.removeEventListener("click", closeModel);
  };

  // Attach event listeners
  deleteYesButton.addEventListener("click", performDelete);
  deleteNoButton.addEventListener("click", closeModel);
  modalDelete.addEventListener("click", closeModel);
};

// Function to update title
const updateTitle = (updateSelectedId) => {
  const showContainer = document.getElementById("container-update-modal");
  const cancelButton = document.getElementById("button-cancel");
  const target = titles?.find(({ id }) => id === updateSelectedId);
  const originalButton = saveButton.innerHTML;
  showContainer.style.display = "flex";
  updatedTitleValue.value = target.title;

  //Save function to save updated title to posts when clicks save button
  const saveHandler = () => {
    saveButton.innerHTML = `<span class="spinner"></span> Saving...`;
    saveButton.disabled = true;
    const updatedTitle = updatedTitleValue.value.trim();
    //Ensue that input has value and update title
    if (updatedTitle) {
      setTimeout(() => {
        titles.find((item) => item.id === updateSelectedId).title =
          updatedTitle;
        genericRenderFunction(container, titles);
        renderPage(currentPage);
        searchHandler();
        syncSearchItems();
        saveButton.disabled = false;
        showContainer.style.display = "none";
        saveButton.innerHTML = originalButton;
        container.style.display = "block";
        // searchedValues.style.display = "none";
        cleanUpHandler();
      }, 2000);
    } else {
      requiredUpdate.style.display = "block";
      saveButton.innerHTML = originalButton;
    }
  };

  //Function for cancel update
  const cancelHandler = () => {
    showContainer.style.display = "none";
    cleanUpHandler();
  };

  // Function to close modal outside click
  const outSideCLikEventHandler = (event) => {
    if (event.target === showContainer) {
      showContainer.style.display = "none";
      cleanUpHandler();
    }
  };

  // Clean up handler for remove multiple event on save function
  const cleanUpHandler = () => {
    saveButton.removeEventListener("click", saveHandler);
    cancelButton.removeEventListener("click", cancelHandler);
    showContainer.removeEventListener("click", outSideCLikEventHandler);
  };

  // Adding event listener
  genericEventAdd(saveButton, saveHandler);
  showContainer.addEventListener("mousedown", outSideCLikEventHandler);
  genericEventAdd(cancelButton, cancelHandler);
};

// Search Function
searchHandler = () => {
  if (searchValue.value) {
    const filteredItems = titles.filter((item) =>
      item.title.toLowerCase().includes(searchValue.value.toLowerCase())
    );
    results.style.display = "block";
    filteredValues = filteredItems;
    genericRenderFunction(results, filteredItems);
    renderPage(currentPage);
    if (filteredItems.length === 0) {
      results.innerHTML = `<l> No matching titles found.</l>`;
    }
  }
};
searchButton.disabled = true;
genericSearchRenderFunction();
searchButton.addEventListener("click", searchHandler);

fetchApi();
