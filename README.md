# Movie and Series Project 🎬

A sophisticated Django-based web application for discovering and exploring movies and TV series, leveraging modern technologies and best practices in web development.

## 🌟 Features

- **Real-time Movie & Series Data**: Integration with TMDB API for up-to-date content
- **Asynchronous Processing**: Using Celery for background tasks and data synchronization
- **Redis Caching**: Efficient data storage and retrieval
- **User Authentication System**: Custom user model with email verification
- **AI-Powered Discovery**: Smart content recommendations (AI integration)
- **Modern UI/UX**: Responsive and user-friendly interface
- **RESTful API Integration**: Clean architecture for external service communication

## 🛠 Technologies Used

### Backend
- **Django 5.2.1**: Modern Python web framework
- **Celery**: Distributed task queue
  - Task queues for movie/series data synchronization
  - Email verification system
  - Automated background jobs
- **Redis**: Cache and message broker
  - Storing latest movies and series data
  - Caching trending content
  - Celery broker functionality

### Frontend
- **HTML/CSS/JavaScript**: Frontend implementation
- **Widget Tweaks**: Django form rendering enhancement

### External Services
- **TMDB API**: Movie and series data source
- **SMTP Integration**: Email verification system

## 🚀 Celery Implementation

The project utilizes Celery for several key functionalities:

1. **Data Synchronization Tasks**:
   - `get_and_store_latest_movies_and_series_task`: Fetches and stores latest content
   - `get_trending_movies_and_series_task`: Updates trending content

2. **Email System**:
   - `send_verification_email_task`: Handles asynchronous email verification
   - Implements retry mechanism for failed email attempts

3. **Task Queues**:
   ```python
   CELERY_TASK_QUEUES = {
       'default': {
           'exchange': 'default',
           'routing_key': 'default',
       },
       'movie_and_series_data_sync': {
           'exchange': 'movie_and_series_data_sync',
           'routing_key': 'movie_and_series_data_sync',
       }
   }
   ```

## 🔧 Setup and Installation

1. Clone the repository
   ```bash
   git clone [your-repository-url]
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   TMDB_API_KEY=your_tmdb_api_key
   ANOTHER_SECRET=your_secret
   LIARA_API_KEY=your_liara_key
   MAIL_HOST=your_mail_host
   MAIL_PORT=your_mail_port
   MAIL_USER=your_mail_user
   MAIL_PASSWORD=your_mail_password
   MAIL_FROM_ADDRESS=your_mail_from
   ```

4. Start Redis server
   ```bash
   redis-server
   ```

5. Run Celery worker
   ```bash
   celery -A MovieAndSeriesProject worker -l info
   ```

6. Run Django development server
   ```bash
   python manage.py runserver
   ```

## 🔐 Security Features

- HTTPS enforcement in production
- HSTS implementation
- Secure cookie handling
- CSRF protection
- Custom user authentication

## 🧪 Testing

Comprehensive test suite including:
- User model tests
- Authentication flow tests
- Celery task tests
- Email verification tests
- Password change functionality tests

## 📝 API Documentation

The project integrates with TMDB API for:
- Latest movies and series
- Trending content
- Actor information
- Detailed content information

## 🎯 Skills Demonstrated

1. **Backend Development**:
   - Django framework expertise
   - Asynchronous programming
   - Task queue implementation
   - Cache management
   - Custom user authentication

2. **System Architecture**:
   - Distributed system design
   - Message queue architecture
   - Caching strategies
   - API integration

3. **Security Implementation**:
   - Secure email verification
   - Production security measures
   - Environment variable management

4. **Testing and Quality Assurance**:
   - Unit testing
   - Integration testing
   - Mock testing

5. **DevOps Knowledge**:
   - Redis configuration
   - Celery worker management
   - Environment setup

## 📈 Future Improvements

- Implement user watchlists
- Add social authentication
- Enhance AI recommendations
- Add real-time notifications
- Implement user reviews and ratings

## 📄 License

[Your License Choice]

## 👤 Author

[Your Name]

---
⭐️ If you find this project helpful, please give it a star! 
