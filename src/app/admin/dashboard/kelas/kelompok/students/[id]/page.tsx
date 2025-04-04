'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentGroupById, getStudentsInGroup, getAvailableStudents, addStudentToGroup, removeStudentFromGroup } from '@/lib/kelompok-kelas';
import { UserPlus, Search, ArrowLeft, AlertCircle, UserX } from 'lucide-react';
import { HomeIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';

export default function ManageStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSearchQuery, setAvailableSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch group details and students in parallel
        const [groupResult, studentsResult] = await Promise.all([getStudentGroupById(groupId), getStudentsInGroup(groupId)]);

        if (groupResult.error) {
          setError(groupResult.error);
          return;
        }

        if (studentsResult.error) {
          setError(studentsResult.error);
          return;
        }

        setGroup(groupResult.studentGroup);
        setStudents(studentsResult.students || []);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const fetchAvailableStudents = async () => {
    try {
      const result = await getAvailableStudents(groupId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAvailableStudents(result.students || []);
    } catch (err) {
      setError('Failed to fetch available students');
    }
  };

  const handleAddStudent = async (studentId: string) => {
    setIsAdding(true);
    try {
      const result = await addStudentToGroup(groupId, studentId);
      if (result.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error,
          confirmButtonColor: '#d33',
        });
        return;
      }

      // Refresh the student lists
      const studentsResult = await getStudentsInGroup(groupId);
      setStudents(studentsResult.students || []);

      // Update available students list
      await fetchAvailableStudents();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Student added to group successfully',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add student to group',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove the student from this group.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsRemoving(true);
        try {
          const result = await removeStudentFromGroup(enrollmentId);
          if (result.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: result.error,
              confirmButtonColor: '#d33',
            });
            return;
          }

          // Refresh the student list
          const studentsResult = await getStudentsInGroup(groupId);
          setStudents(studentsResult.students || []);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student removed from group successfully',
            confirmButtonColor: '#3085d6',
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to remove student from group',
            confirmButtonColor: '#d33',
          });
        } finally {
          setIsRemoving(false);
        }
      }
    });
  };

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) => student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || student.email?.toLowerCase().includes(searchQuery.toLowerCase()) || student.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter available students based on search query
  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      student.name?.toLowerCase().includes(availableSearchQuery.toLowerCase()) || student.email?.toLowerCase().includes(availableSearchQuery.toLowerCase()) || student.phone?.toLowerCase().includes(availableSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/kelas/kelompok">Kelompok</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Manage Students</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard/kelas/kelompok')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : group ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Group: {group.name} - {group.course_types.title} ({group.course_types.type})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search students..." className="pl-8 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (open) fetchAvailableStudents();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Add Student to Group</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Search available students..." className="pl-8 w-full" value={availableSearchQuery} onChange={(e) => setAvailableSearchQuery(e.target.value)} />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAvailableStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                {availableSearchQuery ? 'No students match your search.' : 'No available students to add.'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAvailableStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={student.profile_picture || ''} alt={student.name} />
                                      <AvatarFallback>{student.name?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{student.name}</div>
                                      <div className="text-xs text-muted-foreground">{student.gender === 'male' ? 'Male' : 'Female'}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {student.email && <div>{student.email}</div>}
                                    {student.phone && <div>{student.phone}</div>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" onClick={() => handleAddStudent(student.id)} disabled={isAdding}>
                                    {isAdding ? (
                                      <>Adding...</>
                                    ) : (
                                      <>
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        {searchQuery ? 'No students match your search.' : 'No students in this group yet. Add students to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.profile_picture || ''} alt={student.name} />
                              <AvatarFallback>{student.name?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.gender === 'male' ? 'Male' : 'Female'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {student.email && <div>{student.email}</div>}
                            {student.phone && <div>{student.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{student.city ? <Badge variant="outline">{student.city}</Badge> : <span className="text-muted-foreground text-sm">Not specified</span>}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveStudent(student.enrollment_id)} disabled={isRemoving}>
                            <UserX className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
