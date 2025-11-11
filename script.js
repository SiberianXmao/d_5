class BookSearch {
    constructor() {
        this.API_URL = 'https://www.googleapis.com/books/v1/volumes';
        this.currentQuery = '';
        this.currentCategory = '';
        this.currentStartIndex = 0;
        this.totalResults = 0;
        
        this.initializeElements();
        this.attachEventListeners();
    }
    
    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.searchBtn = document.getElementById('searchBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsInfo = document.getElementById('resultsInfo');
        this.totalResultsSpan = document.getElementById('totalResults');
        this.booksContainer = document.getElementById('booksContainer');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
    }
    
    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchBooks());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchBooks();
        });
        this.loadMoreBtn.addEventListener('click', () => this.loadMoreBooks());
    }
    
    async searchBooks() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            alert('Пожалуйста, введите поисковый запрос');
            return;
        }
        
        this.currentQuery = query;
        this.currentCategory = this.categoryFilter.value;
        this.currentStartIndex = 0;
        
        this.showLoading();
        this.hideError();
        this.hideLoadMore();
        
        try {
            const books = await this.fetchBooks(this.currentQuery, this.currentCategory, 0);
            this.displayBooks(books);
            this.updateResultsInfo();
        } catch (error) {
            this.showError();
            console.error('Ошибка поиска:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadMoreBooks() {
        this.currentStartIndex += 10;
        this.showLoading();
        
        try {
            const books = await this.fetchBooks(this.currentQuery, this.currentCategory, this.currentStartIndex);
            this.displayBooks(books, true);
        } catch (error) {
            this.showError();
            console.error('Ошибка загрузки:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchBooks(query, category = '', startIndex = 0) {
        let searchQuery = query;
        
        if (category) {
            searchQuery += `+subject:${category}`;
        }
        
        const url = `${this.API_URL}?q=${encodeURIComponent(searchQuery)}&startIndex=${startIndex}&maxResults=10`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Ошибка сети');
        }
        
        const data = await response.json();
        this.totalResults = data.totalItems || 0;
        
        return data.items || [];
    }
    
    displayBooks(books, append = false) {
        if (!append) {
            this.booksContainer.innerHTML = '';
        }
        
        if (books.length === 0 && !append) {
            this.booksContainer.innerHTML = '<p class="no-results">Книги не найдены. Попробуйте изменить запрос.</p>';
            return;
        }
        
        books.forEach(book => {
            const bookCard = this.createBookCard(book);
            this.booksContainer.appendChild(bookCard);
        });
        
        if (this.currentStartIndex + 10 < this.totalResults) {
            this.showLoadMore();
        } else {
            this.hideLoadMore();
        }
    }
    
    createBookCard(book) {
        const bookInfo = book.volumeInfo;
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const coverUrl = bookInfo.imageLinks?.thumbnail || '';
        const title = bookInfo.title || 'Название не указано';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Автор не указан';
        const description = bookInfo.description || 'Описание отсутствует';
        
        card.innerHTML = `
            ${coverUrl ? 
                `<img src="${coverUrl}" alt="${title}" class="book-cover">` : 
                `<div class="book-cover no-cover">Обложка отсутствует</div>`
            }
            <div class="book-title">${title}</div>
            <div class="book-author">👤 ${authors}</div>
            <div class="book-description">${description}</div>
        `;
        
        return card;
    }
    
    updateResultsInfo() {
        if (this.totalResults > 0) {
            this.totalResultsSpan.textContent = this.totalResults;
            this.resultsInfo.classList.remove('hidden');
        } else {
            this.resultsInfo.classList.add('hidden');
        }
    }
    
    showLoading() {
        this.loading.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    showError() {
        this.errorMessage.classList.remove('hidden');
    }
    
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    
    showLoadMore() {
        this.loadMoreContainer.classList.remove('hidden');
    }
    
    hideLoadMore() {
        this.loadMoreContainer.classList.add('hidden');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new BookSearch();
});