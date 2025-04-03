'use client';

import { useState, useRef } from 'react';
import { Star, Calendar, BookOpen, PlayCircle, Clock, BarChart3 } from 'lucide-react';
import type { ListClass, Mentor, CourseType } from '@/types';
import { RichTextContent } from '@/components/rich-text-content';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseTypeSelection } from './course-type-selection';
import CourseReviews from './course-reviews';
import Image from 'next/image';

interface DetailCourseProps {
  course: ListClass & {
    course_reviews?: Array<{
      id: string;
      rating: number;
      review: string;
      created_at?: string | Date;
      student?: {
        name: string;
        profile_picture?: string;
      };
    }>;
  };
  mentor?: Mentor;
  courseTypes?: CourseType[];
}

export default function DetailCourse({ course, mentor, courseTypes = [] }: DetailCourseProps) {
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);
  const courseTypeRef = useRef<HTMLDivElement>(null);
  const mentorImage = mentor?.profile_picture && typeof mentor.profile_picture === 'string' ? mentor.profile_picture : '/images/mentor.png';

  // Function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(course.trailer);

  const handleSelectCourseType = (courseType: CourseType) => {
    setSelectedCourseType(courseType);
    // You can add additional logic here, like scrolling to checkout section
  };

  return (
    <div className="min-h-screen bg-background mt-10">
      {/* Hero Section - Modern gradient with smoother transition */}
      <div className="bg-gradient-to-r from-[#4a89dc] via-[#5596DF] to-[#5596DF] text-primary-foreground py-20 px-6 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5 bg-repeat"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col gap-6">
            {course.categories && course.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.categories.map((category) => (
                  <Badge key={category.id} variant="secondary" className="text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors duration-200">
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <Avatar className="h-8 w-8 border-2 border-white/30">
                  <AvatarImage
                    src={typeof mentorImage === 'string' ? mentorImage : '/images/mentor.png'}
                    alt={mentor?.name || 'Mentor'}
                    onError={(e) => {
                      console.error('Error loading mentor image:', mentorImage);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">{mentor?.name?.charAt(0) || 'M'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{mentor?.name || 'Mentor'}</span>
              </div>

              <div className="flex items-center gap-1 text-yellow-300 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-primary-foreground text-sm ml-1">5.0</span>
              </div>

              <div className="flex items-center">
                <Badge variant="outline" className="text-xs font-medium border-white/30 text-primary-foreground bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                  {course.level || 'Beginner'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Section */}
            <Card className="overflow-hidden border-none shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl">
              {videoId ? (
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={course.title}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="bg-muted h-64 flex items-center justify-center rounded-xl">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PlayCircle className="w-12 h-12" />
                    <p>Video tidak tersedia</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 overflow-hidden">
                <TabsTrigger value="description" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#5596DF] data-[state=active]:shadow-sm flex gap-2 py-3 px-4 transition-all duration-200">
                  <BookOpen className="w-5 h-5" />
                  Deskripsi
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="rounded-lg data-[state=active]:bg-[#5596DF] data-[state=active]:text-white flex gap-2 py-3 px-4 transition-all duration-200">
                  <BookOpen className="w-5 h-5" />
                  Silabus
                </TabsTrigger>
                <TabsTrigger value="review" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#5596DF] data-[state=active]:shadow-sm flex gap-2 py-3 px-4 transition-all duration-200">
                  <Star className="w-5 h-5" />
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[#5596DF]">Deskripsi Kelas</h2>
                  <div className="prose prose-gray max-w-none dark:prose-invert">
                    {typeof course.description === 'string' ? (
                      <RichTextContent content={course.description} />
                    ) : (
                      <p className="leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>

                {course.categories && course.categories.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Kategori</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.categories.map((category) => (
                        <Badge key={category.id} variant="outline" className="text-sm bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="syllabus" className="mt-6 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Apa saja yang akan dipelajari</h2>
                  <div className="space-y-4">
                    {course.syllabus && course.syllabus.length > 0 ? (
                      course.syllabus.map((item, index) => (
                        <div key={item.id} className="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5596DF] text-white font-bold text-sm">{index + 1}</div>
                          <div>
                            <p className="font-bold text-gray-800">{item.title}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors duration-200">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5596DF] text-white font-bold text-sm">1</div>
                        <div>
                          <p className="font-bold text-gray-800">LARAVEL 11</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Tool yang digunakan</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {course.tools && course.tools.length > 0 ? (
                      course.tools.map((tool) => (
                        <div key={tool.id} className="bg-blue-50/50 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-100">
                          <div className="mb-3">
                            {/* Check if the tool has a logo property */}
                            {'logo' in tool && tool.logo && typeof tool.logo === 'string' ? (
                              <Image
                                src={tool.logo || '/placeholder.svg?height=80&width=80'}
                                alt={tool.name}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-contain"
                                onError={(e) => {
                                  console.error('Error loading tool image:', tool.logo);
                                  (e.target as HTMLImageElement).src = '/placeholder.svg?height=80&width=80';
                                }}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-green-300 rounded-xl flex items-center justify-center text-gray-800 font-bold">{tool.name.charAt(0)}</div>
                            )}
                          </div>
                          <h3 className="text-gray-800 font-semibold text-lg mb-3">{tool.name}</h3>
                          {/* Check if the tool has a url property */}
                          {'url' in tool && tool.url && (
                            <a href={tool.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="default" className="bg-[#5596DF] hover:bg-[#4a89dc] text-white rounded-full px-6 transition-colors duration-200">
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-blue-50/50 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-100">
                        <div className="mb-3">
                          <div className="w-20 h-20 bg-green-300 rounded-xl flex items-center justify-center text-gray-800 font-bold">V</div>
                        </div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-3">Visual Studio Code</h3>
                        <Button variant="default" className="bg-[#5596DF] hover:bg-[#4a89dc] text-white rounded-full px-6 transition-colors duration-200">
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[#5596DF]">Review</h2>
                  <CourseReviews courseId={course.id} courseName={course.title} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="overflow-hidden rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl">
                <div className="relative">
                  <Image
                    src={course.thumbnail && typeof course.thumbnail === 'string' ? course.thumbnail : '/placeholder.svg?height=200&width=400'}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Error loading thumbnail:', course.thumbnail);
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=200&width=400';
                    }}
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <Badge className="bg-[#5596DF]/90 hover:bg-[#5596DF] transition-colors duration-200">{course.level || 'Beginner'}</Badge>
                    <Badge variant="outline" className="bg-black/50 text-white border-white/20 hover:bg-black/60 transition-colors duration-200">
                      {course.meetings} Pertemuan
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12 border border-[#5596DF]/20">
                        <AvatarImage src={typeof mentorImage === 'string' ? mentorImage : '/images/mentor.png'} alt={mentor?.name || 'Mentor'} />
                        <AvatarFallback className="bg-[#5596DF]/10 text-[#5596DF]">{mentor?.name?.charAt(0) || 'M'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-muted-foreground">Mentor</p>
                        <p className="font-medium">{mentor?.name || 'Mentor'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-[#5596DF]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Materi</p>
                          <p className="font-medium">{course.syllabus?.length || 1}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-[#5596DF]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Level</p>
                          <p className="font-medium">{course.level || 'Beginner'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#5596DF]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pertemuan</p>
                          <p className="font-medium">{course.meetings}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#5596DF]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Durasi</p>
                          <p className="font-medium">8 Jam</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-[#5596DF] hover:bg-[#4a89dc] text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => {
                      courseTypeRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Gabung Kelas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Type Selection Section */}
      {courseTypes.length > 0 && (
        <div ref={courseTypeRef}>
          <CourseTypeSelection courseTypes={courseTypes} onSelectCourseType={handleSelectCourseType} />
        </div>
      )}
    </div>
  );
}
