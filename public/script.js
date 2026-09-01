const API_URL = "/api/students";

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");

const studentId = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

const message = document.getElementById("message");

// Load students when page opens
document.addEventListener("DOMContentLoaded", loadStudents);

// CREATE / UPDATE
studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim()
    };

    try {

        let response;

        if (studentId.value) {

            response = await fetch(
                `${API_URL}/${studentId.value}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

        } else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong");
        }

        showMessage(
            studentId.value
                ? "Student updated successfully!"
                : "Student added successfully!",
            "success"
        );

        resetForm();
        loadStudents();

    } catch (error) {

        showMessage(error.message, "error");

    }
});

// READ
async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        const students = await response.json();

        if (!response.ok) {
            throw new Error(students.error || "Failed to load students");
        }

        studentTableBody.innerHTML = "";

        if (students.length === 0) {

            studentTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }

        students.forEach((student) => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${escapeHTML(student.name)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>${escapeHTML(student.course)}</td>

                <td>

                    <button
                        class="edit"
                        onclick="editStudent(${student.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete"
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>

                </td>
            `;

            studentTableBody.appendChild(row);

        });

    } catch (error) {

        showMessage(error.message, "error");

    }
}

// GET single student
async function editStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const student = await response.json();

        if (!response.ok) {
            throw new Error(student.error);
        }

        studentId.value = student.id;
        nameInput.value = student.name;
        emailInput.value = student.email;
        courseInput.value = student.course;

        formTitle.textContent = "Edit Student";
        submitButton.textContent = "Update Student";
        cancelButton.style.display = "inline-block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        showMessage(error.message, "error");

    }
}

// DELETE
async function deleteStudent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error);
        }

        showMessage(
            "Student deleted successfully!",
            "success"
        );

        loadStudents();

    } catch (error) {

        showMessage(error.message, "error");

    }
}

// Reset form
function resetForm() {

    studentForm.reset();

    studentId.value = "";

    formTitle.textContent = "Add Student";

    submitButton.textContent = "Add Student";

    cancelButton.style.display = "none";
}

// Cancel edit
function cancelEdit() {
    resetForm();
}

// Show message
function showMessage(text, type) {

    message.innerHTML = `
        <div class="${type}">
            ${escapeHTML(text)}
        </div>
    `;

    setTimeout(() => {
        message.innerHTML = "";
    }, 3000);
}

// Basic HTML escaping
function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}