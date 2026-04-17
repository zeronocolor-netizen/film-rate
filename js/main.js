// Đợi DOM load xong mới chạy
document.addEventListener("DOMContentLoaded", () => {
    const movieListContainer = document.getElementById("movieList");
    const searchInput = document.getElementById("searchInput");
    const reviewForm = document.getElementById("reviewForm");

    // Chuyển đường dẫn ảnh sang dạng an toàn
    function getImagePath(path) {
        if (!path) return "";
        return path.split("/").map(part => encodeURIComponent(part)).join("/");
    }

    // --- 1. HIỂN THỊ DANH SÁCH PHIM ---
    async function loadMovies() {
        if (!movieListContainer) return;

        try {
            const response = await fetch("movies.json");
            const movies = await response.json();

            displayMovies(movies);

            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    const keyword = e.target.value.toLowerCase();
                    const filtered = movies.filter(m =>
                        m.title.toLowerCase().includes(keyword)
                    );
                    displayMovies(filtered);
                });
            }
        } catch (error) {
            console.error("Lỗi tải phim:", error);
        }
    }

    function displayMovies(movies) {
        movieListContainer.innerHTML = movies.map(movie => `
            <div class="film-card">
                <img src="${getImagePath(movie.image)}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.rating}</p>
                <a href="detail.html?id=${movie.id}">Xem chi tiết</a>
            </div>
        `).join("");
    }

    // --- 2. TRANG CHI TIẾT ---
    async function loadMovieDetail() {
        const detailContainer = document.querySelector(".movie-detail");
        if (!detailContainer) return;

        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get("id");

        try {
            const response = await fetch("movies.json");
            const movies = await response.json();
            const movie = movies.find(m => String(m.id) === String(movieId));

            if (movie) {
               detailContainer.innerHTML = `
    <div class="top-detail">
        <img src="${getImagePath(movie.image)}" alt="${movie.title}">
        
        <div class="info">
            <h2>${movie.title}</h2>
            <p><strong>Đánh giá:</strong> ⭐ ${movie.rating}</p>
            <p><strong>Thể loại:</strong> ${Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</p>
            <p class="description">${movie.description || ""}</p>
        </div>
    </div>

    ${movie.trailer ? `
    <div class="trailer">
        <iframe 
            src="https://www.youtube.com/embed/${movie.trailer}" 
            allowfullscreen>
        </iframe>
    </div>
    ` : ""}
`;
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
        }
    }

    // --- 3. QUẢN LÝ ĐÁNH GIÁ ---

    // Gửi đánh giá
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const movieId = urlParams.get("id");

            const name = document.getElementById("name").value.trim();
            const rating = document.getElementById("rating").value;
            const comment = document.getElementById("comment").value.trim();

            if (!name || !rating || !comment) {
                alert("Vui lòng điền đầy đủ thông tin!");
                return;
            }

            const newReview = {
                id: Date.now(),
                name,
                rating,
                comment,
                date: new Date().toLocaleString()
            };

            let reviews = JSON.parse(localStorage.getItem(`reviews_${movieId}`)) || [];
            reviews.push(newReview);
            localStorage.setItem(`reviews_${movieId}`, JSON.stringify(reviews));

            reviewForm.reset();
            window.loadReviews(movieId); // FIX
        });
    }

    // Hiển thị đánh giá
    window.loadReviews = function(movieId) {
        const reviewList = document.getElementById("reviewList");
        if (!reviewList) return;

        const reviews = JSON.parse(localStorage.getItem(`reviews_${movieId}`)) || [];

        const html = [...reviews].reverse().map(rev => `
            <div class="review-item" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e50914;">
                <p style="color: white"><strong>${rev.name}</strong> - ⭐ ${rev.rating}/10</p>
                <p style="font-style: italic; font-size: 0.8rem; color: #aaa;">${rev.date}</p>
                <p style="color: white">${rev.comment}</p>
                <button type="button"
                    onclick='deleteReview(${JSON.stringify(movieId)}, ${JSON.stringify(rev.id)})'
                    style="background: #e50914; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-top: 5px;">
                    🗑️ Xoá
                </button>
            </div>
        `).join("");

        reviewList.innerHTML = html || "<p style='color: #aaa;'>Chưa có đánh giá nào.</p>";
    };

    // Xoá đánh giá (FIX CHUẨN)
    window.deleteReview = function(movieId, reviewId) {
        if (confirm("Bạn có chắc chắn muốn xoá không?")) {
            let reviews = JSON.parse(localStorage.getItem(`reviews_${movieId}`)) || [];

            const updatedReviews = reviews.filter(
                rev => String(rev.id) !== String(reviewId)
            );

            localStorage.setItem(`reviews_${movieId}`, JSON.stringify(updatedReviews));
            window.loadReviews(movieId);
        }
    };

    

    // Chạy
    loadMovies();
    loadMovieDetail();
});