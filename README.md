# Movie and Series Project 🎬

A sophisticated Django-based web application for discovering and exploring movies and TV series, leveraging modern technologies and best practices in web development. The project showcases advanced implementation of asynchronous processing, AI-powered recommendations, and comprehensive testing.

## 🌟 Features

- **Real-time Movie & Series Data**: Integration with TMDB API for up-to-date content
- **AI-Powered Recommendations**: 
  - Integration with OpenAI's GPT models via Liara.ai
  - Personalized movie and series suggestions based on user preferences
  - Asynchronous processing of recommendations
- **Advanced Asynchronous Processing**: 
  - Celery for background tasks and data synchronization
  - Async/Await implementation for API calls
  - Parallel processing of movie/series data
- **Redis Caching & Data Management**: 
  - Efficient data storage and retrieval
  - Caching of trending and latest content
  - Task queue management
- **Comprehensive User System**: 
  - Custom user model with email verification
  - User preferences and likes tracking
  - Secure password management
- **Modern UI/UX**: Responsive and user-friendly interface
- **RESTful API Integration**: Clean architecture for external service communication

## 🛠 Technologies Used

### Backend
- **Django 5.2.1**: Modern Python web framework
- **Celery**: Advanced distributed task queue implementation
  - Automated content synchronization
  - AI recommendation processing
  - Email verification system
  - Asynchronous background jobs
- **Redis**: Multi-purpose data store
  - Caching latest and trending content
  - Celery broker functionality
  - Session management
- **Async Processing**:
  - aiohttp for async API calls
  - asyncio for concurrent operations

### AI Integration
- **OpenAI GPT Integration**: 
  - Custom AI recommendation system
  - Liara.ai API integration
  - Intelligent content suggestions

### Frontend
- **HTML/CSS/JavaScript**: Modern frontend implementation
- **Widget Tweaks**: Enhanced Django form rendering
- **Responsive Design**: Mobile-first approach

### External Services
- **TMDB API**: Comprehensive movie and series data source
- **Liara.ai**: AI processing platform
- **SMTP Integration**: Robust email verification system

## 🚀 Advanced Celery Implementation

The project showcases sophisticated Celery usage:

1. **Content Management Tasks**:
   ```python
   @shared_task()
   def get_and_store_latest_movies_and_series_task():
       movies_list = get_and_store_latest_movies_or_series("movies")
       series_list = get_and_store_latest_movies_or_series("series")
       return {"latest_movies": movies_list, "latest_series": series_list}
   ```

2. **AI Recommendation System**:
   ```python
   @shared_task
   def update_ai_recommendations(user_id):
       # Fetch user preferences
       # Process AI recommendations
       # Async API calls for content details
       # Store personalized suggestions
   ```

3. **Asynchronous Processing**:
   ```python
   async def fetch_details(session, title, media_type):
       search_result = await search_tmdb_item_details_async(session, title, media_type)
       # Process and return details
   ```

## 🧪 Comprehensive Testing

The project includes extensive test coverage:

1. **User Authentication Tests**:
   - Email verification flow
   - Password management
   - User registration and login

2. **AI Integration Tests**:
   - Recommendation system
   - API response handling
   - Error scenarios

3. **Async Operation Tests**:
   - Celery task execution
   - Redis caching
   - API integrations

4. **Security Tests**:
   - Authentication flows
   - Data protection
   - API security

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

## 🎯 Advanced Skills Demonstrated

1. **Asynchronous Programming**:
   - Celery task management
   - asyncio/aiohttp implementation
   - Parallel processing
   - Event-driven architecture

2. **AI Integration**:
   - OpenAI API implementation
   - Custom recommendation algorithms
   - Async processing of AI responses

3. **System Architecture**:
   - Distributed system design
   - Cache management
   - Task queue optimization
   - API integration patterns

4. **Testing and Quality Assurance**:
   - Comprehensive test suite
   - Integration testing
   - Async testing patterns
   - Security testing

5. **Performance Optimization**:
   - Redis caching strategies
   - Async operations
   - Batch processing
   - Resource management

## 📈 Future Improvements

- Enhanced AI recommendation algorithms
- Real-time notifications system
- Social authentication integration
- Advanced user analytics
- Mobile application development

---
⭐️ If you find this project helpful, please give it a star! 
