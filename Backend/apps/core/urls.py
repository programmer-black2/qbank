# # apps/core/urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     EducationStageViewSet, CourseViewSet, 
#     YearViewSet, ExamTypeViewSet, CategoryTreeView
# )

# router = DefaultRouter()
# router.register('education-stages', EducationStageViewSet, basename='education-stage')
# router.register('courses', CourseViewSet, basename='course')
# router.register('years', YearViewSet, basename='year')
# router.register('exam-types', ExamTypeViewSet, basename='exam-type')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('category-tree/', CategoryTreeView.as_view(), name='category-tree'),
# ]

# apps/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EducationStageViewSet, CourseViewSet, 
    YearViewSet, ExamTypeViewSet, 
    CategoryTreeView, CategoryBreadcrumbView,
    PublicSiteStatsView
)

router = DefaultRouter()
router.register('education-stages', EducationStageViewSet, basename='education-stage')
router.register('courses', CourseViewSet, basename='course')
router.register('years', YearViewSet, basename='year')
router.register('exam-types', ExamTypeViewSet, basename='exam-type')

urlpatterns = [
    path('', include(router.urls)),
    path('site-stats/', PublicSiteStatsView.as_view(), name='site-stats'),
    path('category-tree/', CategoryTreeView.as_view(), name='category-tree'),
    path('category-breadcrumb/', CategoryBreadcrumbView.as_view(), name='category-breadcrumb'),
]
