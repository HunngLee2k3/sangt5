document.addEventListener('DOMContentLoaded', () => {
    // Lấy danh sách người dùng khi trang tải
    fetchUsers();

    // Xử lý form thêm người dùng
    const form = document.getElementById('add-user-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        // Gửi dữ liệu người dùng mới đến backend
        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!response.ok) {
                throw new Error('Failed to add user');
            }

            // Làm mới danh sách người dùng
            fetchUsers();
            form.reset();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user. Please try again.');
        }
    });
});

// Hàm lấy danh sách người dùng từ backend
async function fetchUsers() {
    try {
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        const userList = document.getElementById('users');
        userList.innerHTML = ''; // Xóa danh sách cũ

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.name} (${user.email})`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users. Please try again.');
    }
}