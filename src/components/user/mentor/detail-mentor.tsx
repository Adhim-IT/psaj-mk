'use client';

import type { Mentor } from '@/types';
import type { Course, CourseStudentGroup, Event } from '@/lib/mentor-userpage';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Award, Calendar, Clock, Users, BookOpen, Tag } from 'lucide-react';
import Link from 'next/link';

interface DetailMentorProps {
  mentor: Mentor;
  courses?: Course[];
  courseGroups?: CourseStudentGroup[];
  events?: Event[];
}

export default function DetailMentor({ mentor, courses = [], courseGroups = [], events = [] }: DetailMentorProps) {
  if (!mentor) {
    return <div>Mentor not found</div>;
  }

  // Format date function
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Mentor Profile Sidebar */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src={typeof mentor.profile_picture === 'string' && mentor.profile_picture ? mentor.profile_picture : '/placeholder.svg?height=400&width=300'}
              alt={mentor.name}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error('Error loading mentor profile picture:', mentor.profile_picture);
                (e.target as HTMLImageElement).src = '/placeholder.svg?height=400&width=300';
              }}
              unoptimized={true}
            />
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#4A90E2]" />
              <span>{mentor.city || 'Location not specified'}</span>
            </div>
            {mentor.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#4A90E2]" />
                <span>{mentor.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#4A90E2]" />
              <span>{mentor.specialization}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4A90E2]" />
              <span>{mentor.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
          </div>
        </div>

        {/* Mentor Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{mentor.name}</h1>
            <p className="text-xl text-[#4A90E2]">{mentor.specialization}</p>
          </div>

          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">Tentang</TabsTrigger>
              <TabsTrigger value="courses">Kelas</TabsTrigger>
              <TabsTrigger value="events">Event</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Biografi</h3>
                    <div className="whitespace-pre-wrap text-gray-700">{mentor.bio || 'Tidak ada biografi tersedia.'}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {courses.length > 0 ? (
                    <div className="space-y-8">
                      <h3 className="text-xl font-semibold mb-4">Kelas yang Diajar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => (
                          <Link href={`/kelas/${course.slug}`} key={course.id} className="group">
                            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <div className="relative h-40">
                                <Image
                                  src={typeof course.thumbnail === 'string' && course.thumbnail ? course.thumbnail : '/placeholder.svg?height=160&width=320'}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    console.error('Error loading course thumbnail:', course.thumbnail);
                                    (e.target as HTMLImageElement).src = '/placeholder.svg?height=160&width=320';
                                  }}
                                  unoptimized={true}
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold group-hover:text-[#4A90E2] transition-colors">{course.title}</h4>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                  <Tag className="h-4 w-4" />
                                  <span>{course.level}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{course.meetings} pertemuan</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {courseGroups.length > 0 && (
                        <>
                          <h3 className="text-xl font-semibold mt-8 mb-4">Grup Kelas</h3>
                          <div className="space-y-4">
                            {courseGroups.map((group) => (
                              <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <h4 className="font-semibold">{group.name}</h4>
                                <p className="text-sm text-gray-700 mt-1">{group.course_types.courses.title}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 text-[#4A90E2]" />
                                    <span>
                                      {formatDate(group.start_date)} - {formatDate(group.end_date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Clock className="h-4 w-4 text-[#4A90E2]" />
                                    <span>{group.total_meeting} pertemuan</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Tag className="h-4 w-4 text-[#4A90E2]" />
                                    <span>{group.course_types.type === 'group' ? 'Grup' : group.course_types.type === 'private' ? 'Private' : 'Batch'}</span>
                                  </div>
                                </div>
                                {group.remarks && <p className="text-sm text-gray-600 mt-2 italic">{group.remarks}</p>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 text-gray-500">Belum ada kelas yang diajar oleh mentor ini.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {events.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold mb-4">Event yang Diselenggarakan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event) => (
                          <Link href={`/event/${event.slug}`} key={event.id} className="group">
                            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <div className="relative h-40">
                                <Image
                                  src={typeof event.thumbnail === 'string' && event.thumbnail ? event.thumbnail : '/placeholder.svg?height=160&width=320'}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    console.error('Error loading event thumbnail:', event.thumbnail);
                                    (e.target as HTMLImageElement).src = '/placeholder.svg?height=160&width=320';
                                  }}
                                  unoptimized={true}
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold group-hover:text-[#4A90E2] transition-colors">{event.title}</h4>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(event.start_date)}
                                    {new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() && ` - ${formatDate(event.end_date)}`}
                                  </span>
                                </div>
                                {event.price && (
                                  <div className="mt-2 font-medium text-[#4A90E2]">
                                    {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                    }).format(Number(event.price))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 text-gray-500">Belum ada event yang diselenggarakan oleh mentor ini.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
