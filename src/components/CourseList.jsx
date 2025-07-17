import React, { useState, useEffect } from 'react';
import { Clock, User, BookOpen, Star, Plus } from 'lucide-react';
import database from '../utils/database';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner'
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await database.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await database.addCourse(newCourse);
      if (error) {
        console.error('Error adding course:', error);
        return;
      }
      
      loadCourses();
      setNewCourse({
        title: '',
        description: '',
        instructor: '',
        duration: '',
        level: 'Beginner'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddCourse} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Course Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Course Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Instructor"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Duration"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Course
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedCourse?.id === course.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
              onClick={() => setSelectedCourse(course)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Details */}
      {selectedCourse && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Title:</strong> {selectedCourse.title}</div>
            <div><strong>Instructor:</strong> {selectedCourse.instructor}</div>
            <div><strong>Duration:</strong> {selectedCourse.duration}</div>
            <div><strong>Level:</strong> {selectedCourse.level}</div>
            {selectedCourse.description && (
              <div><strong>Description:</strong> {selectedCourse.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
