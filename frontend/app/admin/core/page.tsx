'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getCurrentUser } from "@/services/auth/auth.api";
import AdminHeader from "@/components/ui/AdminHeader";
import { 
  getCategoryTree, 
  getEducationStages,
  getCourses,
  getYears,
  createEducationStage,
  createCourse,
  createYear,
  createExamType,
  updateEducationStage,
  updateCourse,
  updateYear,
  updateExamType,
  deleteEducationStage,
  deleteCourse,
  deleteYear,
  deleteExamType,
  CategoryNode,
  EducationStage,
  Course,
  Year
} from "@/services/core/core.api";

type CategoryItemType = 'stage' | 'course' | 'year' | 'exam_type';
type ModalMode = 'create' | 'edit';
type CoreFormData = Partial<Record<
  'name_education_stage' | 'name_course' | 'stage_id' | 'years_number' | 'course_id' | 'name_exam_types' | 'year_id',
  string | number | undefined
>>;

interface AdminUser {
  full_name?: string;
}

const getInitialFormData = (
  type: CategoryItemType,
  parentId?: number,
  initialData?: CoreFormData
): CoreFormData => {
  if (initialData) {
    return initialData;
  }

  if (type === 'course' && parentId) {
    return { stage_id: parentId };
  }
  if (type === 'year' && parentId) {
    return { course_id: parentId };
  }
  if (type === 'exam_type' && parentId) {
    return { year_id: parentId };
  }

  return {};
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && !('response' in error)) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          detail?: string;
        };
      };
    }).response;

    return response?.data?.message || response?.data?.error || response?.data?.detail || fallback;
  }

  return fallback;
};

interface CreateItemModalProps {
  isOpen: boolean;
  type: CategoryItemType;
  mode: ModalMode;
  parentId?: number;
  initialData?: CoreFormData;
  onClose: () => void;
  onSubmit: (data: CoreFormData) => Promise<void>;
  stages: EducationStage[];
  courses: Course[];
  years: Year[];
}

function CreateItemModal({ isOpen, type, mode, parentId, initialData, onClose, onSubmit, stages, courses, years }: CreateItemModalProps) {
  const [formData, setFormData] = useState<CoreFormData>(() => getInitialFormData(type, parentId, initialData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      setError(getApiErrorMessage(error, 'خطا در ثبت اطلاعات'));
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
    const action = mode === 'edit' ? 'ویرایش' : 'افزودن';
    switch (type) {
      case 'stage': return `${action} مقطع تحصیلی`;
      case 'course': return `${action} دوره`;
      case 'year': return `${action} سال`;
      case 'exam_type': return `${action} نوع آزمون`;
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
                mode === 'edit' ? 'ذخیره تغییرات' : 'ایجاد'
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
  onEdit,
  onDelete 
}: { 
  node: CategoryNode; 
  level?: number;
  onAdd: (type: CategoryItemType, parentId?: number) => void;
  onEdit: (node: CategoryNode) => void;
  onDelete: (type: CategoryItemType, id: number) => void;
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
              onClick={() => onAdd(getNextType(node.type) as CategoryItemType, node.id)}
              className="text-green-600 hover:text-green-800"
              title="افزودن زیرمجموعه"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEdit(node)}
            className="text-blue-600 hover:text-blue-800"
            title="ویرایش"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L12 14.828 8 16l1.172-4 8.414-8.414z" />
            </svg>
          </button>
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
              onEdit={onEdit}
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
  const [, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<CategoryNode[]>([]);
  const [stages, setStages] = useState<EducationStage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    type: CategoryItemType;
    mode: ModalMode;
    nodeId?: number;
    parentId?: number;
    initialData?: CoreFormData;
  }>({ isOpen: false, type: 'stage', mode: 'create' });

  const loadData = useCallback(async () => {
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
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      await loadData();
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [loadData, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkAuth]);

  const handleAddItem = (type: CategoryItemType, parentId?: number) => {
    setModalData({ isOpen: true, type, mode: 'create', parentId });
  };

  const handleEditItem = (node: CategoryNode) => {
    const initialData = (() => {
      switch (node.type) {
        case 'stage':
          return { name_education_stage: node.name };
        case 'course':
          return {
            stage_id: node.metadata?.stage_id,
            name_course: node.name
          };
        case 'year':
          return {
            course_id: node.metadata?.course_id,
            years_number: node.metadata?.year_number
          };
        case 'exam_type':
          return {
            year_id: node.metadata?.year_id,
            name_exam_types: node.metadata?.name_exam_types
          };
      }
    })();

    setModalData({
      isOpen: true,
      type: node.type,
      mode: 'edit',
      nodeId: node.id,
      initialData
    });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, type: 'stage', mode: 'create' });
  };

  const handleSubmitModal = async (formData: CoreFormData) => {
    console.log('Submitting:', modalData.mode, modalData.type, formData);
    
    try {
      let result: unknown;
      const isEdit = modalData.mode === 'edit';

      if (isEdit && !modalData.nodeId) {
        throw new Error('شناسه مورد برای ویرایش پیدا نشد');
      }

      switch (modalData.type) {
        case 'stage':
          result = isEdit
            ? await updateEducationStage(modalData.nodeId!, formData as { name_education_stage: string })
            : await createEducationStage(formData as { name_education_stage: string });
          break;
        case 'course':
          result = isEdit
            ? await updateCourse(modalData.nodeId!, formData as { name_course: string; stage_id?: number })
            : await createCourse(formData as { name_course: string; stage_id?: number });
          break;
        case 'year':
          result = isEdit
            ? await updateYear(modalData.nodeId!, formData as { years_number: number; course_id?: number })
            : await createYear(formData as { years_number: number; course_id?: number });
          break;
        case 'exam_type':
          result = isEdit
            ? await updateExamType(modalData.nodeId!, formData as { name_exam_types: string; year_id?: number })
            : await createExamType(formData as { name_exam_types: string; year_id?: number });
          break;
      }
      
      console.log('Saved successfully:', result);
      await loadData();
      handleCloseModal();
    } catch (error: unknown) {
      console.error('Error saving item:', error);
      // خطا را دوباره throw کن تا modal بتونه handle کنه
      throw error;
    }
  };

  const handleDeleteItem = async (type: CategoryItemType, id: number) => {
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
    } catch (error: unknown) {
      console.error('Error deleting item:', error);
      alert(getApiErrorMessage(error, 'خطا در حذف مورد انتخاب‌شده'));
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
      <AdminHeader
        title="مدیریت طبقه‌بندی سوالات"
        subtitle="مقاطع، دوره‌ها، سال‌ها و انواع آزمون را مرتب و قابل استفاده نگه دارید"
        backHref="/admin/dashboard"
        variant="green"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">درخت طبقه‌بندی سوالات</h2>
            <p className="text-gray-500 text-sm mt-1">
              مقاطع تحصیلی، دوره‌ها، سال‌ها و انواع آزمون را مدیریت کنید
            </p>
          </div>

          <button
            onClick={() => handleAddItem('stage')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition-colors hover:bg-green-700 sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            افزودن مقطع جدید
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
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalData.isOpen && (
        <CreateItemModal
          isOpen={modalData.isOpen}
          type={modalData.type}
          mode={modalData.mode}
          parentId={modalData.parentId}
          initialData={modalData.initialData}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          stages={stages}
          courses={courses}
          years={years}
        />
      )}
    </div>
  );
}
