'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from "@/services/auth/auth.api";
import { 
  getCategoryTree, 
  getEducationStages,
  getCourses,
  getYears,
  getExamTypes,
  createEducationStage,
  createCourse,
  createYear,
  createExamType,
  deleteEducationStage,
  deleteCourse,
  deleteYear,
  deleteExamType,
  CategoryNode,
  EducationStage,
  Course,
  Year,
  ExamType
} from "@/services/core/core.api";

interface CreateItemModalProps {
  isOpen: boolean;
  type: 'stage' | 'course' | 'year' | 'exam_type';
  parentId?: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
  stages: EducationStage[];
  courses: Course[];
  years: Year[];
}

function CreateItemModal({ isOpen, type, parentId, onClose, onSubmit, stages, courses, years }: CreateItemModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setError('');
      if (type === 'course' && parentId) {
        setFormData({ stage_id: parentId });
      } else if (type === 'year' && parentId) {
        setFormData({ course_id: parentId });
      } else if (type === 'exam_type' && parentId) {
        setFormData({ year_id: parentId });
      } else {
        setFormData({});
      }
    }
  }, [isOpen, type, parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert numeric fields
      const processedData = { ...formData };
      
      // Convert IDs to numbers
      if (processedData.stage_id) {
        processedData.stage_id = Number(processedData.stage_id);
      }
      if (processedData.course_id) {
        processedData.course_id = Number(processedData.course_id);
      }
      if (processedData.year_id) {
        processedData.year_id = Number(processedData.year_id);
      }
      if (processedData.years_number) {
        processedData.years_number = Number(processedData.years_number);
      }

      await onSubmit(processedData);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.message || error.message || 'خطا در ثبت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'stage': return 'افزودن مقطع تحصیلی جدید';
      case 'course': return 'افزودن دوره جدید';
      case 'year': return 'افزودن سال جدید';
      case 'exam_type': return 'افزودن نوع آزمون جدید';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{getTitle()}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {type === 'stage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام مقطع</label>
              <input
                type="text"
                name="name_education_stage"
                value={formData.name_education_stage || ''}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: پزشکی، دندانپزشکی"
              />
            </div>
          )}

          {type === 'course' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مقطع تحصیلی</label>
                <select
                  name="stage_id"
                  value={formData.stage_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب کنید</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name_education_stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام دوره</label>
                <input
                  type="text"
                  name="name_course"
                  value={formData.name_course || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: فیزیولوژی، آناتومی"
                />
              </div>
            </>
          )}

          {type === 'year' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">دوره</label>
                <select
                  name="course_id"
                  value={formData.course_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب کنید</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.stage_name} - {course.name_course}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سال</label>
                <input
                  type="number"
                  name="years_number"
                  value={formData.years_number || ''}
                  onChange={handleChange}
                  required
                  min={1300}
                  max={1450}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: 1403، 1404"
                />
                <p className="text-xs text-gray-500 mt-1">سال شمسی (مثال: 1403)</p>
              </div>
            </>
          )}

          {type === 'exam_type' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سال</label>
                <select
                  name="year_id"
                  value={formData.year_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب کنید</option>
                  {years.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.course_name} - سال {year.years_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع آزمون</label>
                <select
                  name="name_exam_types"
                  value={formData.name_exam_types || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="midterm">میان‌ترم</option>
                  <option value="final">پایان‌ترم</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ثبت...</span>
                </div>
              ) : (
                'ایجاد'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TreeNodeComponent({ 
  node, 
  level = 0, 
  onAdd, 
  onDelete 
}: { 
  node: CategoryNode; 
  level?: number;
  onAdd: (type: string, parentId?: number) => void;
  onDelete: (type: string, id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'stage':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
          </svg>
        );
      case 'course':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'year':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'exam_type':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getNextType = (type: string) => {
    switch (type) {
      case 'stage': return 'course';
      case 'course': return 'year';
      case 'year': return 'exam_type';
      default: return null;
    }
  };

  const canAdd = (type: string) => {
    return ['stage', 'course', 'year'].includes(type);
  };

  return (
    <div className={`${level > 0 ? 'border-l-2 border-gray-200 mr-4 pl-4' : ''}`}>
      <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg group">
        <div className="flex items-center space-x-3 space-x-reverse">
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {getIcon(node.type)}
          <span className="font-medium text-gray-900">{node.name}</span>
          {node.type === 'exam_type' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {node.question_count || 0} سوال
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
          {canAdd(node.type) && (
            <button
              onClick={() => onAdd(getNextType(node.type)!, node.id)}
              className="text-green-600 hover:text-green-800"
              title="افزودن زیرمجموعه"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(node.type, node.id)}
            className="text-red-600 hover:text-red-800"
            title="حذف"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && node.children && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNodeComponent 
              key={child.id} 
              node={child} 
              level={level + 1}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCorePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<CategoryNode[]>([]);
  const [stages, setStages] = useState<EducationStage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    type: 'stage' | 'course' | 'year' | 'exam_type';
    parentId?: number;
  }>({ isOpen: false, type: 'stage' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      await loadData();
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      console.log('Loading data...');
      const [treeResponse, stagesResponse, coursesResponse, yearsResponse] = await Promise.all([
        getCategoryTree(),
        getEducationStages(),
        getCourses(),
        getYears()
      ]);
      
      console.log('Data loaded:', {
        tree: treeResponse,
        stages: stagesResponse,
        courses: coursesResponse,
        years: yearsResponse
      });
      
      setTreeData(treeResponse);
      setStages(stagesResponse);
      setCourses(coursesResponse);
      setYears(yearsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
      
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      router.push('/admin/login');
    }
  };

  const backToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleAddItem = (type: 'stage' | 'course' | 'year' | 'exam_type', parentId?: number) => {
    setModalData({ isOpen: true, type, parentId });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, type: 'stage' });
  };

  const handleSubmitModal = async (formData: any) => {
    console.log('Submitting:', modalData.type, formData);
    
    try {
      let result;
      switch (modalData.type) {
        case 'stage':
          result = await createEducationStage(formData);
          break;
        case 'course':
          result = await createCourse(formData);
          break;
        case 'year':
          result = await createYear(formData);
          break;
        case 'exam_type':
          result = await createExamType(formData);
          break;
      }
      
      console.log('Created successfully:', result);
      await loadData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error creating item:', error);
      // خطا را دوباره throw کن تا modal بتونه handle کنه
      throw error;
    }
  };

  const handleDeleteItem = async (type: string, id: number) => {
    if (!confirm('آیا از حذف این مورد مطمئن هستید؟')) return;

    try {
      switch (type) {
        case 'stage':
          await deleteEducationStage(id);
          break;
        case 'course':
          await deleteCourse(id);
          break;
        case 'year':
          await deleteYear(id);
          break;
        case 'exam_type':
          await deleteExamType(id);
          break;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={backToDashboard}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">بازگشت به داشبورد</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 11H5m14-4H3m16 8H7m12 4H3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">مدیریت طبقه‌بندی سوالات</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-600">
                خوش آمدید، {user?.full_name || 'ادمین'}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 space-x-reverse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-800">درخت طبقه‌بندی سوالات</h2>
            <p className="text-gray-500 text-sm mt-1">
              مقاطع تحصیلی، دوره‌ها، سال‌ها و انواع آزمون را مدیریت کنید
            </p>
          </div>

          <button
            onClick={() => handleAddItem('stage')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>افزودن مقطع جدید</span>
          </button>
        </div>

        {/* Tree View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {treeData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 11H5m14-4H3m16 8H7m12 4H3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز طبقه‌بندی‌ای ایجاد نشده</h3>
              <p className="text-gray-500 mb-4">اولین مقطع تحصیلی را ایجاد کنید</p>
              <button
                onClick={() => handleAddItem('stage')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                افزودن مقطع اول
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {treeData.map((node) => (
                <TreeNodeComponent 
                  key={node.id} 
                  node={node}
                  onAdd={handleAddItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <CreateItemModal
        isOpen={modalData.isOpen}
        type={modalData.type}
        parentId={modalData.parentId}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        stages={stages}
        courses={courses}
        years={years}
      />
    </div>
  );
}