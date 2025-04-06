'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, User, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourseTypesByCourseId } from '@/lib/course-types';
import type { CourseType } from '@/types';

interface CourseTypeSelectionProps {
  courseTypes: CourseType[];
  courseId?: string;
  onSelectCourseType?: (courseType: CourseType) => void;
}

export function CourseTypeSelection({ courseTypes: initialCourseTypes, courseId, onSelectCourseType }: CourseTypeSelectionProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [courseTypes, setCourseTypes] = useState<CourseType[]>(initialCourseTypes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh course types data
  const refreshCourseTypes = async () => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { courseTypes: freshTypes, error: typesError } = await getCourseTypesByCourseId(courseId);

      if (typesError) {
        setError(typesError);
        console.error('Error refreshing course types:', typesError);
      } else if (freshTypes && freshTypes.length > 0) {
        setCourseTypes(freshTypes);
        console.log(`Refreshed ${freshTypes.length} course types successfully`);
      } else {
        setCourseTypes([]);
        console.log('No course types found after refresh');
      }
    } catch (error) {
      setError('Failed to refresh course types');
      console.error('Error in refreshCourseTypes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data on initial load if courseId is provided
  useEffect(() => {
    if (courseId) {
      refreshCourseTypes();
    }
  }, [courseId]);

  // Function to check if a course type is expired
  const isExpired = (courseType: CourseType) => {
    if (!courseType.end_date) return false;
    const endDate = new Date(courseType.end_date);
    const today = new Date();
    return endDate < today;
  };

  // Filter course types by type and exclude expired ones
  const allTypes = courseTypes.filter((type) => type.is_active && !isExpired(type));
  const batchTypes = allTypes.filter((type) => type.type === 'batch');
  const privateTypes = allTypes.filter((type) => type.type === 'private');
  const groupTypes = allTypes.filter((type) => type.type === 'group');

  const handleSelectCourseType = (courseType: CourseType) => {
    if (onSelectCourseType) {
      onSelectCourseType(courseType);
    }

    // Navigate to checkout page with the selected course type
    router.push(`/checkout?course=${courseType.slug}`);
  };

  // Function to render price with discount
  const renderPrice = (courseType: CourseType) => {
    if (!courseType.is_discount || !courseType.discount) {
      return (
        <div className="mt-2">
          <span className="text-2xl font-bold text-[#4A90E2]">Rp {courseType.normal_price.toLocaleString('id-ID')}</span>
        </div>
      );
    }

    let discountedPrice = courseType.normal_price;
    if (courseType.discount_type === 'percentage') {
      discountedPrice = courseType.normal_price - (courseType.normal_price * courseType.discount) / 100;
    } else {
      discountedPrice = courseType.normal_price - courseType.discount;
    }

    return (
      <div className="mt-2">
        <span className="text-2xl font-bold text-[#4A90E2]">Rp {discountedPrice.toLocaleString('id-ID')}</span>
        <span className="ml-2 text-sm line-through text-muted-foreground">Rp {courseType.normal_price.toLocaleString('id-ID')}</span>
      </div>
    );
  };

  // Function to render course type card
  const renderCourseTypeCard = (courseType: CourseType) => {
    const typeIcon = courseType.type === 'batch' ? <Users className="h-5 w-5" /> : courseType.type === 'private' ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />;

    const typeLabel = courseType.type === 'batch' ? 'Batch' : courseType.type === 'private' ? 'Private' : 'Group';

    return (
      <Card key={courseType.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg border-[#E5E7EB] group min-h-[380px] flex flex-col">
        <CardHeader className="pb-2 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-[#EBF5FF] text-[#4A90E2] shadow-sm">{typeIcon}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">{typeLabel} Class</CardTitle>
              {courseType.batch_number && <CardDescription className="text-sm font-medium text-gray-600">Batch {courseType.batch_number}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4 flex-grow">
          {renderPrice(courseType)}

          <div className="mt-4 space-y-2">
            {courseType.start_date && courseType.end_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#F9FAFB] p-2 rounded-md">
                <CalendarDays className="h-4 w-4 text-[#4A90E2]" />
                <span>
                  {new Date(courseType.start_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(courseType.end_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-6">
          <Button className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] transition-all duration-300 shadow-sm group-hover:shadow-md" onClick={() => handleSelectCourseType(courseType)}>
            Pilih Kelas <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Function to render skeleton cards during loading
  const renderSkeletonCards = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden border-[#E5E7EB] min-h-[380px] flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4 flex-grow">
            <Skeleton className="h-8 w-36 mb-6" />
            <Skeleton className="h-16 w-full rounded-md" />
          </CardContent>
          <CardFooter className="pt-4 pb-6">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ));
  };

  // Filter displayed course types based on selected tab
  const displayedCourseTypes = selectedTab === 'all' ? allTypes : selectedTab === 'batch' ? batchTypes : selectedTab === 'private' ? privateTypes : groupTypes;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">Pilih Tipe Kelas</h2>
            {courseId && (
              <Button variant="ghost" size="sm" className="rounded-full" onClick={refreshCourseTypes} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Pilih tipe kelas yang sesuai dengan kebutuhan belajar Anda</p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-xl w-full max-w-md">
              <div className="grid grid-cols-4 gap-1">
                <div className={`cursor-pointer rounded-lg p-2 text-center font-medium transition-all ${selectedTab === 'all' ? 'bg-white text-[#4A90E2] shadow-sm' : 'hover:bg-gray-200'}`} onClick={() => setSelectedTab('all')}>
                  Semua
                </div>
                <div className={`cursor-pointer rounded-lg p-2 text-center font-medium transition-all ${selectedTab === 'batch' ? 'bg-white text-[#4A90E2] shadow-sm' : 'hover:bg-gray-200'}`} onClick={() => setSelectedTab('batch')}>
                  Batch
                </div>
                <div className={`cursor-pointer rounded-lg p-2 text-center font-medium transition-all ${selectedTab === 'private' ? 'bg-white text-[#4A90E2] shadow-sm' : 'hover:bg-gray-200'}`} onClick={() => setSelectedTab('private')}>
                  Private
                </div>
                <div className={`cursor-pointer rounded-lg p-2 text-center font-medium transition-all ${selectedTab === 'group' ? 'bg-white text-[#4A90E2] shadow-sm' : 'hover:bg-gray-200'}`} onClick={() => setSelectedTab('group')}>
                  Group
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {error && (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" className="mt-4" onClick={refreshCourseTypes} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Mencoba ulang...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Coba lagi
                    </>
                  )}
                </Button>
              </div>
            )}

            {!error && isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderSkeletonCards()}</div>
            ) : !error && displayedCourseTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{displayedCourseTypes.map((courseType) => renderCourseTypeCard(courseType))}</div>
            ) : (
              !error && (
                <div className="text-center py-10">
                  <p className="text-gray-500">Tidak ada tipe kelas yang tersedia untuk kategori ini.</p>
                  {courseId && (
                    <Button variant="outline" className="mt-4" onClick={refreshCourseTypes} disabled={isLoading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
