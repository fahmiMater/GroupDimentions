import React from 'react';
import {
  Settings,
  Grid3x3,
  Layers,
  FileText,
  FileInput,
  TrendingUp,
  Users,
  Database,
  Activity,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCodeDefinitions } from '@/hooks/useCodeDefinitions';
import { useDimensionalGroups } from '@/hooks/useDimensionalGroups';
import { useDimensionals } from '@/hooks/useDimensionals';
import { useFields } from '@/hooks/useFields';
import Button from '@/components/ui/Button';

const Dashboard: React.FC = () => {
  // Get statistics
  const { data: codeDefinitions } = useCodeDefinitions();
  const { data: dimensionalGroups } = useDimensionalGroups();
  const { data: dimensionals } = useDimensionals();
  const { data: fields } = useFields();

  const stats = [
    {
      title: 'تعريف الأكواد',
      value: codeDefinitions?.length || 0,
      change: '+12%',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-blue-500',
      link: '/code-definitions',
      description: 'إجمالي الأكواد المُعرّفة'
    },
    {
      title: 'مجموعات الأبعاد',
      value: dimensionalGroups?.length || 0,
      change: '+8%',
      icon: <Grid3x3 className="w-8 h-8" />,
      color: 'bg-green-500',
      link: '/dimensional-groups',
      description: 'المجموعات المُصممة'
    },
    {
      title: 'الأبعاد',
      value: dimensionals?.length || 0,
      change: '+15%',
      icon: <Layers className="w-8 h-8" />,
      color: 'bg-purple-500',
      link: '/dimensionals',
      description: 'عناصر الأبعاد الفردية'
    },
    {
      title: 'الحقول',
      value: fields?.length || 0,
      change: '+5%',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-orange-500',
      link: '/fields',
      description: 'حقول البيانات المُحددة'
    }
  ];

  const quickActions = [
    {
      title: 'إضافة تعريف كود جديد',
      description: 'إنشاء تعريف كود جديد للنظام',
      icon: <Settings className="w-6 h-6" />,
      link: '/code-definitions',
      color: 'bg-blue-50 text-blue-600 border border-blue-200'
    },
    {
      title: 'إضافة مجموعة أبعاد',
      description: 'إنشاء مجموعة أبعاد جديدة',
      icon: <Grid3x3 className="w-6 h-6" />,
      link: '/dimensional-groups',
      color: 'bg-green-50 text-green-600 border border-green-200'
    },
    {
      title: 'إدارة الأبعاد',
      description: 'إضافة وتعديل الأبعاد',
      icon: <Layers className="w-6 h-6" />,
      link: '/dimensionals',
      color: 'bg-purple-50 text-purple-600 border border-purple-200'
    },
    {
      title: 'تكوين الحقول',
      description: 'إعداد وإدارة الحقول',
      icon: <FileText className="w-6 h-6" />,
      link: '/fields',
      color: 'bg-orange-50 text-orange-600 border border-orange-200'
    },
    {
      title: 'إدخال البيانات',
      description: 'إضافة القيم الفعلية للحقول',
      icon: <FileInput className="w-6 h-6" />,
      link: '/data-management',
      color: 'bg-indigo-50 text-indigo-600 border border-indigo-200'
    },
    {
      title: 'عرض التقارير',
      description: 'استعراض وتحليل البيانات',
      icon: <BarChart3 className="w-6 h-6" />,
      link: '/reports',
      color: 'bg-red-50 text-red-600 border border-red-200'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'تم إضافة تعريف كود جديد',
      details: 'كود التعريف: SYS001',
      time: 'منذ ساعتين',
      type: 'create',
      icon: <Settings className="w-4 h-4" />
    },
    {
      id: 2,
      action: 'تم تعديل مجموعة أبعاد',
      details: 'مجموعة الإعدادات الأساسية',
      time: 'منذ 4 ساعات',
      type: 'update',
      icon: <Grid3x3 className="w-4 h-4" />
    },
    {
      id: 3,
      action: 'تم إدخال بيانات جديدة',
      details: 'بيانات البعد: التصنيف الفرعي',
      time: 'منذ يوم واحد',
      type: 'create',
      icon: <FileInput className="w-4 h-4" />
    },
    {
      id: 4,
      action: 'تم إنشاء حقل جديد',
      details: 'حقل الوصف التفصيلي',
      time: 'منذ يومين',
      type: 'create',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 5,
      action: 'تم إنشاء تقرير',
      details: 'تقرير الإحصائيات الشهرية',
      time: 'منذ 3 أيام',
      type: 'report',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  // إحصائيات متقدمة - إصلاح المشكلة
  const activeGroups = dimensionalGroups?.filter(g => g.is_active)?.length || 0;
  const activeDimensionals = dimensionals?.filter(d => d.is_active)?.length || 0;
  const totalFields = fields?.length || 0;
  const totalDimensionals = dimensionals?.length || 0;
  
  // حساب معدل الاكتمال بأمان
  const completionRate = React.useMemo(() => {
    if (!totalFields || totalFields === 0) return 0;
    if (!totalDimensionals || totalDimensionals === 0) return 0;
    return Math.round((activeDimensionals / totalFields) * 100);
  }, [activeDimensionals, totalFields, totalDimensionals]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-primary shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">أهلاً بك في نظام إدارة المجموعات الأبعاد</h1>
            <p className="text-blue-100 text-lg mb-4">
              إدارة شاملة ومتقدمة لجميع عناصر النظام والبيانات الأبعاد
            </p>
            <div className="flex gap-4">
              <Link to="/data-management">
                <Button className="bg-secondary text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                  <FileInput className="w-4 h-4" />
                  ابدأ إدخال البيانات
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="ghost" className="text-primary border-white hover:bg-white hover:text-blue-600 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  عرض التقارير
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center">
            <Database className="w-24 h-24 text-blue-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          نظرة عامة على التقدم
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${Math.min(completionRate, 100)}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">اكتمال النظام</p>
            <p className="text-xs text-gray-500">نسبة الأبعاد النشطة</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-lg inline-block mb-3">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{activeGroups}</p>
            <p className="text-sm font-medium text-gray-600">مجموعات نشطة</p>
            <p className="text-xs text-gray-500">من أصل {dimensionalGroups?.length || 0}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-lg inline-block mb-3">
              <Layers className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{activeDimensionals}</p>
            <p className="text-sm font-medium text-gray-600">أبعاد نشطة</p>
            <p className="text-xs text-gray-500">جاهزة لإدخال البيانات</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              إجراءات سريعة
            </h3>
            <p className="text-sm text-gray-600 mt-1">الأعمال الشائعة والمهمة</p>
          </div>
          <div className="p-6 space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex items-start gap-4 p-4 rounded-lg hover:shadow-sm transition-all duration-200 ${action.color}`}
              >
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs opacity-75 mt-1">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              النشاط الأخير
            </h3>
            <p className="text-sm text-gray-600 mt-1">آخر العمليات والتحديثات</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'update' ? 'bg-blue-500' :
                    activity.type === 'report' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                عرض جميع الأنشطة →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
