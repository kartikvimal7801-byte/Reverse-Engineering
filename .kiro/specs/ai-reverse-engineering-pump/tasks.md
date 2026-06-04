# Implementation Plan: AI-Based Reverse Engineering System

## Overview

This implementation plan breaks down the AI-Based Reverse Engineering System into discrete coding tasks that build incrementally toward a working full-stack web application. The approach prioritizes getting core infrastructure working first, then progressively adding workflow steps, AI integration, and reporting capabilities. Each task references specific requirements and builds on previous work.

## Tasks

- [x] 1. Set up project infrastructure and core database schema
  - Initialize Node.js project with Express, TypeScript, PostgreSQL dependencies
  - Create database schema with migrations for users, projects, workflow_steps, components, measurements, materials, performance_data, cost_data, ai_analysis, management_reviews, reports, files tables
  - Set up connection pooling with pg-pool
  - Configure environment variables for database, S3, and AI service credentials
  - _Requirements: 1.3, 1.4, 16.2, 16.8_

- [ ]* 1.1 Write unit tests for database models and connection
  - Test database connection and pooling
  - Test CRUD operations for each model
  - Test foreign key constraints and cascading deletes
  - _Requirements: 16.9_

- [ ] 2. Implement authentication system
  - [ ] 2.1 Create user registration and login API endpoints
    - Implement POST /api/auth/login with JWT token generation
    - Implement POST /api/auth/logout with session invalidation
    - Implement GET /api/auth/session for session verification
    - Hash passwords using bcrypt (cost factor 12)
    - Store session tokens in httpOnly cookies
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ]* 2.2 Write unit tests for authentication endpoints
    - Test valid login credentials
    - Test invalid credentials rejection
    - Test session creation and validation
    - Test password hashing
    - _Requirements: 17.3_
  
  - [ ] 2.3 Implement authentication middleware
    - Create middleware to verify JWT tokens on protected routes
    - Implement role-based access control (user vs manager)
    - Track last request timestamp for inactivity timeout (30 minutes)
    - Redirect unauthenticated requests to login
    - _Requirements: 17.5, 17.6, 17.7, 17.8_

  - [ ]* 2.4 Write integration tests for authentication flow
    - Test end-to-end login and session management
    - Test protected route access with and without valid tokens
    - Test session timeout behavior
    - _Requirements: 17.7, 17.8_

- [ ] 3. Implement project CRUD operations and file upload
  - [ ] 3.1 Create project management API endpoints
    - Implement POST /api/projects to create new projects with unique ID and timestamp
    - Implement GET /api/projects with pagination (20 per page)
    - Implement GET /api/projects/:id to retrieve project details
    - Implement PUT /api/projects/:id to update project name and notes
    - Implement DELETE /api/projects/:id with confirmation and ownership validation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ] 3.2 Implement file upload service with S3 integration
    - Create POST /api/files/upload endpoint using Multer
    - Validate file format and size before upload
    - Upload files to S3 and return presigned URLs
    - Implement DELETE /api/files/:fileId to remove files from S3
    - Store file metadata in files table
    - _Requirements: 2.2, 2.4, 3.4, 14.4, 14.5_
  
  - [ ]* 3.3 Write unit tests for project CRUD operations
    - Test project creation with unique ID generation
    - Test pagination logic
    - Test update and delete with ownership validation
    - Test error handling for non-existent projects
    - _Requirements: 1.9_
  
  - [ ]* 3.4 Write integration tests for file upload
    - Test successful file upload to S3
    - Test file size validation (reject >10MB for images, >100MB for CAD)
    - Test file format validation
    - Test file deletion from S3
    - _Requirements: 14.5, 14.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Build React frontend foundation
  - [ ] 5.1 Initialize React application with routing
    - Create React app with TypeScript
    - Install React Router, Axios, React Hook Form, Material-UI
    - Set up routing for Dashboard, Login, and Workflow pages
    - Configure Axios with base URL and authentication interceptors
    - _Requirements: 17.1_
  
  - [ ] 5.2 Create authentication components
    - Build Login component with username and password fields
    - Implement form validation and submission to POST /api/auth/login
    - Store JWT token and handle authentication errors
    - Create PrivateRoute component to protect authenticated pages
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 5.3 Build Dashboard component
    - Create project list display with pagination (20 per page)
    - Display project ID, name, creation date, current step, status
    - Implement "Create Project" button calling POST /api/projects
    - Add edit, delete, and view actions for each project
    - Implement delete confirmation dialog
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8, 1.10_
  
  - [ ]* 5.4 Write frontend unit tests for authentication and dashboard
    - Test Login component rendering and form submission
    - Test Dashboard project list rendering
    - Test pagination controls
    - Test create, edit, delete actions
    - _Requirements: 1.1, 17.3_

- [ ] 6. Implement workflow stepper and state management
  - [ ] 6.1 Create workflow navigation component
    - Build Workflow Stepper showing 11 steps with visual status (completed, current, upcoming, locked)
    - Display current step number and title
    - Enable navigation to completed steps by clicking step indicator
    - Disable navigation to incomplete steps
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 6.2 Implement workflow state management API
    - Create GET /api/projects/:projectId/steps/:stepNumber to retrieve step data
    - Create POST /api/projects/:projectId/steps/:stepNumber to save step data
    - Create PUT /api/projects/:projectId/steps/:stepNumber/complete to mark step complete
    - Store step data in workflow_steps.data JSONB field
    - Update project.current_step when step completes
    - _Requirements: 13.5, 13.6, 13.9, 16.2_

  - [ ] 6.3 Implement auto-save functionality
    - Add debounced auto-save triggering 5 seconds after last user interaction
    - Call POST /api/projects/:projectId/steps/:stepNumber with current form data
    - Implement retry logic (3 attempts, 2-second intervals)
    - Fallback to localStorage on exhausted retries
    - Display warning message on save failure
    - _Requirements: 16.1, 16.2, 16.4, 16.5, 16.6_
  
  - [ ]* 6.4 Write integration tests for workflow state management
    - Test step data retrieval and saving
    - Test step completion and current_step update
    - Test auto-save with retry logic
    - Test localStorage fallback
    - _Requirements: 16.4, 16.5_

- [ ] 7. Implement Step 1 - Benchmark Product Selection
  - [ ] 7.1 Create Step 1 form component
    - Build form with fields: product name, model number, manufacturer, category, supplier info, market data
    - Implement multi-image upload (max 10, PNG/JPEG/JPG, 10MB each)
    - Add client-side validation for required fields and file constraints
    - Integrate with auto-save functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 7.2 Create Step 1 backend validation and storage
    - Validate required fields (product name, model number, manufacturer)
    - Validate image uploads (format, size, count)
    - Store product details, supplier info, market data in workflow_steps.data
    - Store uploaded image URLs in files table
    - Enable navigation to Step 2 on successful completion
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 14.1, 14.2, 14.3_
  
  - [ ]* 7.3 Write unit tests for Step 1 validation
    - Test required field validation
    - Test image upload constraints (format, size, count)
    - Test successful data storage
    - _Requirements: 2.6, 2.7, 14.4_

- [ ] 8. Implement Step 2 - Product Teardown Documentation
  - [ ] 8.1 Create Step 2 component list manager
    - Build interface to add up to 500 components
    - Implement part ID input (50 chars max)
    - Add photo upload per component (max 10, 10MB each, JPEG/PNG/HEIC)
    - Create assembly sequence editor with ordered steps (500 chars per description)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 8.2 Create Step 2 backend validation and storage
    - Validate component count (max 500)
    - Validate part ID length and photo constraints
    - Store components in components table with photo URLs
    - Store assembly sequence in workflow_steps.data
    - Require at least 1 component with 1 photo for completion
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 8.3 Write unit tests for Step 2 validation
    - Test component count limit enforcement
    - Test part ID length validation
    - Test photo upload constraints
    - Test completion validation (min 1 component with 1 photo)
    - _Requirements: 3.7, 3.10_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Step 3 - 3D Scanning and Measurement Capture
  - [ ] 10.1 Create Step 3 measurement entry component
    - Display components from Step 2
    - Add measurement input fields per component (0.001-99999.999mm, 3 decimal places)
    - Implement CAD file upload (STEP/IGES/STL, 100MB max)
    - Add geometry data fields (shape type, tolerances)
    - _Requirements: 4.1, 4.2, 4.4, 4.6_
  
  - [ ] 10.2 Create Step 3 backend validation and storage
    - Validate measurement ranges and decimal precision
    - Validate CAD file format and size
    - Store measurements in measurements table
    - Require at least 1 measurement per component for completion
    - _Requirements: 4.3, 4.5, 4.7, 4.8, 4.9, 14.7, 14.8_
  
  - [ ]* 10.3 Write unit tests for Step 3 validation
    - Test measurement range validation (0.001-99999.999)
    - Test decimal precision validation (3 places)
    - Test CAD file constraints
    - Test completion requirement (1 measurement per component)
    - _Requirements: 4.3, 4.8_

- [ ] 11. Implement Step 4 - Material Identification
  - [ ] 11.1 Create Step 4 material entry component
    - Display components from Step 2
    - Add material text fields per component (casting, shaft, impeller, fasteners - 100 chars max)
    - Validate character limits client-side
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 11.2 Create Step 4 backend validation and storage
    - Validate material field length (100 chars max)
    - Store materials in materials table
    - Require at least 1 material value for completion
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.10_
  
  - [ ]* 11.3 Write unit tests for Step 4 validation
    - Test character limit validation
    - Test completion requirement (at least 1 material specified)
    - Test empty field handling
    - _Requirements: 5.6, 5.9_

- [ ] 12. Implement Step 5 - Performance Benchmarking
  - [ ] 12.1 Create Step 5 performance data entry component
    - Add labeled fields: head (0-1000m), discharge (0-100000 LPM), efficiency (0-100%), power (0-1000000W)
    - Implement numeric validation with 2 decimal places
    - Display validation errors for out-of-range values
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 12.2 Create Step 5 backend validation and storage
    - Validate numeric ranges and decimal precision for all 4 fields
    - Store performance data in performance_data table
    - Require all 4 fields for completion
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.10_
  
  - [ ]* 12.3 Write unit tests for Step 5 validation
    - Test range validation for each field
    - Test decimal precision validation (2 places)
    - Test completion requirement (all 4 fields)
    - _Requirements: 6.6, 6.7, 6.9_

- [ ] 13. Implement Step 6 - Cost Breakdown Analysis
  - [ ] 13.1 Create Step 6 cost entry component
    - Display components from Step 2
    - Add BOM cost input per component (0-999,999,999.99, 2 decimals)
    - Add fields: manufacturing cost, assembly cost, logistics cost (same validation)
    - Calculate and display total cost (sum of all costs, 2 decimals)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7_
  
  - [ ] 13.2 Create Step 6 backend validation and storage
    - Validate cost ranges and decimal precision
    - Calculate total product cost server-side
    - Store cost data in cost_data table
    - Require all cost fields for completion
    - _Requirements: 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [ ]* 13.3 Write unit tests for Step 6 validation and calculations
    - Test cost range validation
    - Test decimal precision validation
    - Test total cost calculation accuracy
    - Test completion requirement
    - _Requirements: 7.6, 7.7, 7.8_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement AI service integration module
  - [ ] 15.1 Create AI service wrapper with OpenAI API
    - Set up OpenAI API client with API key from environment
    - Implement retry logic (3 attempts, exponential backoff: 2s, 4s, 8s)
    - Set 60-second timeout for all AI API calls
    - Log all requests and responses for debugging
    - Handle API errors and return structured error responses
    - _Requirements: 8.1, 8.2, 8.9, 9.1_

  - [ ]* 15.2 Write unit tests for AI service wrapper
    - Test retry logic on API failures
    - Test timeout handling (60s)
    - Test error response formatting
    - Mock OpenAI API for tests
    - _Requirements: 8.9, 9.10_

- [ ] 16. Implement Step 7 - AI Design Evaluation
  - [ ] 16.1 Create Step 7 AI evaluation endpoint
    - Implement POST /api/ai/evaluate-design/:projectId
    - Compile data from Steps 1-6 into input JSON
    - Call AI service with prompt for design evaluation
    - Parse AI response into structured format: improvement opportunities, cost reductions, reliability improvements, manufacturability improvements
    - Store results in ai_analysis table with status tracking
    - Return job ID for status polling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.8_
  
  - [ ] 16.2 Create Step 7 frontend component
    - Add "Analyze" button to trigger POST /api/ai/evaluate-design/:projectId
    - Display loading spinner during analysis (60s timeout)
    - Poll for results or use webhook callback
    - Display improvement opportunities, cost reductions, reliability improvements, manufacturability improvements
    - Handle timeout and error scenarios with retry button
    - Enable step completion only on successful analysis
    - _Requirements: 8.1, 8.7, 8.9, 8.10, 8.11, 15.1, 15.2, 15.3, 15.4, 15.7, 15.8_
  
  - [ ]* 16.3 Write integration tests for Step 7 AI evaluation
    - Test end-to-end evaluation flow with mocked AI service
    - Test timeout handling
    - Test error handling and retry
    - Test zero outputs scenario
    - _Requirements: 8.9, 8.10_

- [ ] 17. Implement Step 8 - Value Engineering Suggestions
  - [ ] 17.1 Create Step 8 value engineering endpoint
    - Implement POST /api/ai/value-engineering/:projectId
    - Compile data from Steps 1-7 into input JSON
    - Call AI service with prompt for value engineering suggestions
    - Parse AI response into: material alternatives (1-10), design alternatives (1-10), process improvements (1-10)
    - Each suggestion includes cost comparison and performance metrics
    - Store results in ai_analysis table
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.8_
  
  - [ ] 17.2 Create Step 8 frontend component
    - Add "Generate Suggestions" button to trigger POST /api/ai/value-engineering/:projectId
    - Display loading spinner (60s timeout)
    - Display material alternatives, design alternatives, process improvements with cost comparisons
    - Handle failures and enable retry
    - Enable step completion on success
    - _Requirements: 9.1, 9.7, 9.9, 9.10, 9.11, 15.1, 15.3, 15.7_

  - [ ]* 17.3 Write integration tests for Step 8 value engineering
    - Test end-to-end suggestion generation with mocked AI service
    - Test suggestion count validation (1-10 per category)
    - Test no suggestions scenario
    - _Requirements: 9.10, 9.11_

- [ ] 18. Implement Step 9 - New Product Concept Generation
  - [ ] 18.1 Create Step 9 concept generation endpoint
    - Implement POST /api/ai/generate-concept/:projectId with selected improvements in request body
    - Compile improvements from Steps 7 and 8 based on user selections
    - Call AI service with prompt for product concept generation
    - Parse AI response into: design concept description, proposed specifications, feature improvements list
    - Store concept data in workflow_steps.data
    - _Requirements: 10.1, 10.3, 10.6, 10.7, 10.8, 10.10_
  
  - [ ] 18.2 Create Step 9 frontend component
    - Display improvements from Steps 7 and 8 with selection checkboxes
    - Add "Generate Concept" button to trigger POST /api/ai/generate-concept/:projectId
    - Display loading spinner (60s timeout)
    - Display design concept description, proposed specifications, feature improvements
    - Handle prerequisite check (Steps 7 and 8 must be complete)
    - Handle generation failures with retry
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.9, 10.11, 15.1, 15.7_
  
  - [ ]* 18.3 Write integration tests for Step 9 concept generation
    - Test end-to-end concept generation with mocked AI service
    - Test prerequisite validation
    - Test timeout handling
    - _Requirements: 10.4, 10.5_

- [ ] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Implement Step 10 - Management Review Workflow
  - [ ] 20.1 Create management review endpoint
    - Implement POST /api/projects/:projectId/review with decision and feedback in request body
    - Validate decision type (approved, rework_required, rejected)
    - Store review in management_reviews table with timestamp and reviewer_id
    - Update project status based on decision
    - Enable Step 11 navigation on approval
    - Return workflow to Step 9 on rework required
    - Prevent Step 11 navigation on rejection
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11_
  
  - [ ] 20.2 Create Step 10 frontend component
    - Display concept from Step 9
    - Add "Approve", "Rework Required", "Reject" buttons
    - Show feedback text field (1000 chars max) for Rework/Reject
    - Submit decision to POST /api/projects/:projectId/review
    - Handle workflow routing based on decision
    - Require Step 9 completion before accessing Step 10
    - _Requirements: 11.1, 11.2, 11.5, 11.6, 11.7, 11.8_

  - [ ]* 20.3 Write unit tests for management review workflow
    - Test each decision type (approve, rework, reject)
    - Test feedback storage
    - Test workflow routing logic
    - _Requirements: 11.3, 11.6, 11.8_

- [ ] 21. Implement Step 11 - Final Report Generation
  - [ ] 21.1 Create PDF report generation service
    - Implement POST /api/reports/generate/:projectId to compile data from Steps 1-10
    - Use PDFKit or Puppeteer to generate PDF report
    - Include: cost comparison, performance comparison, improvement summary, uploaded images, data tables, AI outputs
    - Handle missing data with notes indicating incomplete comparison data
    - Set 300-second timeout for generation
    - Store PDF in S3 and save URL in reports table
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.13_
  
  - [ ] 21.2 Create Step 11 frontend component
    - Add "Generate Report" button to trigger POST /api/reports/generate/:projectId
    - Display loading spinner (300s timeout)
    - Show download button on successful generation
    - Implement GET /api/reports/:reportId/download for PDF download
    - Handle generation failures with retry
    - _Requirements: 12.11, 12.12, 12.14, 15.1_
  
  - [ ]* 21.3 Write integration tests for report generation
    - Test end-to-end report generation with sample data
    - Test PDF content includes all required sections
    - Test missing data handling
    - Test download functionality
    - _Requirements: 12.14_

- [ ] 22. Implement data validation and error handling
  - [ ] 22.1 Add comprehensive frontend validation
    - Display inline error messages within 1 second of invalid input
    - Highlight invalid fields with red borders
    - Validate required fields before step completion
    - Validate numeric ranges and formats client-side
    - Disable completion button while validation errors exist
    - _Requirements: 14.1, 14.2, 14.3, 14.7, 14.8, 14.9, 14.10_
  
  - [ ] 22.2 Add comprehensive backend validation
    - Validate all numeric data for range and format
    - Validate file uploads for format and size
    - Return structured error responses with field-level details
    - Implement proper HTTP status codes (400, 401, 403, 404, 408, 413, 422, 500, 503)
    - _Requirements: 14.4, 14.5, 14.6, 14.7, 14.8_
  
  - [ ]* 22.3 Write unit tests for validation logic
    - Test all numeric range validations
    - Test all file upload validations
    - Test required field validations
    - Test error message formatting
    - _Requirements: 14.1, 14.4, 14.9_

- [ ] 23. Implement error handling and recovery
  - [ ] 23.1 Add frontend error handling
    - Implement toast/snackbar notifications for network errors
    - Add retry buttons for failed operations
    - Implement localStorage fallback for unsaved data
    - Display specific error messages for different failure types
    - _Requirements: 14.5, 14.6, 16.5, 16.6_
  
  - [ ] 23.2 Add backend error handling and logging
    - Wrap all database operations in try-catch blocks
    - Implement Winston logging for all errors
    - Add transaction rollback for multi-step operations
    - Implement S3 connectivity checks and retry logic (3 attempts, exponential backoff)
    - Clean up partial uploads on failure
    - _Requirements: 14.6, 16.4, 16.9_
  
  - [ ]* 23.3 Write integration tests for error recovery
    - Test auto-save retry and localStorage fallback
    - Test S3 upload retry logic
    - Test transaction rollback scenarios
    - _Requirements: 16.4, 16.6_

- [ ] 24. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Add security hardening and polish
  - [ ] 25.1 Implement security best practices
    - Add rate limiting on all API endpoints
    - Implement CSRF protection
    - Use parameterized queries for all database operations
    - Sanitize all user inputs
    - Validate file uploads using magic bytes (not just extensions)
    - Set secure httpOnly cookies for sessions
    - Configure HTTPS for all communications
    - _Requirements: 17.1, 17.4_
  
  - [ ] 25.2 Add audit logging for sensitive operations
    - Log all authentication events (login, logout, session expiry)
    - Log all project creation, modification, deletion events
    - Log all management review decisions
    - Log all AI analysis executions
    - Store timestamps in ISO 8601 format
    - _Requirements: 1.4, 8.8, 11.9, 15.9_
  
  - [ ]* 25.3 Write security tests
    - Test SQL injection prevention
    - Test CSRF protection
    - Test rate limiting
    - Test file upload validation (magic bytes)
    - _Requirements: 17.1_

- [ ] 26. Add performance optimizations
  - [ ] 26.1 Implement caching and optimization
    - Set up Redis for session caching
    - Implement database query caching for frequent reads
    - Add CDN for static assets
    - Optimize database indexes for common queries
    - _Requirements: 1.1, 16.8_

  - [ ]* 26.2 Write performance tests
    - Load test with 100 concurrent users
    - Test large file uploads (100MB CAD files)
    - Test database query performance with 1000+ projects
    - Test PDF generation time (<300s target)
    - _Requirements: 12.2_

- [ ] 27. Final integration and end-to-end testing
  - [ ]* 27.1 Write end-to-end workflow tests
    - Test complete workflow from Step 1 to Step 11
    - Test project creation → data entry → AI analysis → approval → report generation
    - Test management review approval flow
    - Test management review rejection flow
    - Test management review rework flow
    - Test session timeout and recovery
    - _Requirements: 13.9, 17.7_
  
  - [ ]* 27.2 Write edge case and error scenario tests
    - Test API timeout handling for all AI endpoints
    - Test file upload failures (network, S3 connectivity)
    - Test validation failures at each step
    - Test data integrity after browser crash and recovery
    - _Requirements: 14.5, 16.7, 16.9, 16.10_

- [ ] 28. Final checkpoint - Ensure all tests pass and application is ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability back to business needs
- The implementation follows an incremental approach: infrastructure → authentication → CRUD → workflow steps → AI integration → reporting → hardening
- Auto-save functionality is implemented early (Task 6.3) to ensure data persistence throughout all workflow steps
- AI integration is isolated in a separate service module (Task 15) for easier testing and maintenance
- Checkpoints are placed after major phases to validate progress and catch issues early
- Security hardening (Task 25) is addressed before final testing to ensure the application is production-ready
- All API endpoints follow RESTful conventions and return structured error responses
- The frontend uses React Hook Form for validation and Material-UI for consistent UI components
- The backend uses Express middleware for authentication, validation, and error handling
- PostgreSQL JSONB fields are used for flexible step data storage while maintaining relational integrity for core entities


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.4", "3.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 5, "tasks": ["5.4", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1"] },
    { "id": 8, "tasks": ["7.3", "8.2"] },
    { "id": 9, "tasks": ["8.3", "10.1"] },
    { "id": 10, "tasks": ["10.2", "11.1"] },
    { "id": 11, "tasks": ["10.3", "11.2"] },
    { "id": 12, "tasks": ["11.3", "12.1"] },
    { "id": 13, "tasks": ["12.2", "13.1"] },
    { "id": 14, "tasks": ["12.3", "13.2"] },
    { "id": 15, "tasks": ["13.3", "15.1"] },
    { "id": 16, "tasks": ["15.2", "16.1"] },
    { "id": 17, "tasks": ["16.2", "17.1"] },
    { "id": 18, "tasks": ["16.3", "17.2"] },
    { "id": 19, "tasks": ["17.3", "18.1"] },
    { "id": 20, "tasks": ["18.2", "20.1"] },
    { "id": 21, "tasks": ["18.3", "20.2"] },
    { "id": 22, "tasks": ["20.3", "21.1"] },
    { "id": 23, "tasks": ["21.2", "22.1"] },
    { "id": 24, "tasks": ["21.3", "22.2"] },
    { "id": 25, "tasks": ["22.3", "23.1"] },
    { "id": 26, "tasks": ["23.2", "25.1"] },
    { "id": 27, "tasks": ["23.3", "25.2"] },
    { "id": 28, "tasks": ["25.3", "26.1"] },
    { "id": 29, "tasks": ["26.2", "27.1"] },
    { "id": 30, "tasks": ["27.2"] }
  ]
}
```
