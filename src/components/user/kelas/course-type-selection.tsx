'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, UserRound } from 'lucide-react';

interface CourseType {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  end_date?: string;
}

interface CourseTypeSelectionProps {
  courseTypes: CourseType[];
  onSelectCourseType: (courseType: CourseType) => void;
}

export default function CourseTypeSelection({ courseTypes, onSelectCourseType }: CourseTypeSelectionProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter course types by active status and end date
  const currentDate = new Date();
  const allTypes = courseTypes.filter((type) => type.is_active && (!type.end_date || new Date(type.end_date) >= currentDate));

  // Filter by course type
  const batchTypes = allTypes.filter((type) => type.type === 'batch');
  const privateTypes = allTypes.filter((type) => type.type === 'private');
  const groupTypes = allTypes.filter((type) => type.type === 'group');

  // Helper function to render course type buttons
  const renderCourseTypeButtons = (types: CourseType[]) => {
    if (types.length === 0) {
      return <p className="text-muted-foreground py-2">No courses available</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {types.map((type) => (
          <Button key={type.id} variant="outline" className="h-auto py-3 px-4 justify-start text-left" onClick={() => onSelectCourseType(type)}>
            <span className="truncate">{type.name}</span>
            {type.end_date && <span className="text-xs text-muted-foreground block mt-1">Available until: {new Date(type.end_date).toLocaleDateString()}</span>}
          </Button>
        ))}
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'batch':
        return <Calendar className="h-4 w-4 mr-2" />;
      case 'private':
        return <UserRound className="h-4 w-4 mr-2" />;
      case 'group':
        return <Users className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-6">Select a Course Type</h2>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center">
              <UserRound className="h-4 w-4 mr-2" />
              Private
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {allTypes.length === 0 ? (
              <p className="text-muted-foreground py-2">No courses available</p>
            ) : (
              <div className="space-y-6">
                {batchTypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Batch Courses
                    </h3>
                    {renderCourseTypeButtons(batchTypes)}
                  </div>
                )}

                {privateTypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <UserRound className="h-5 w-5 mr-2" />
                      Private Courses
                    </h3>
                    {renderCourseTypeButtons(privateTypes)}
                  </div>
                )}

                {groupTypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Group Courses
                    </h3>
                    {renderCourseTypeButtons(groupTypes)}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="batch">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Batch Courses
            </h3>
            {renderCourseTypeButtons(batchTypes)}
          </TabsContent>

          <TabsContent value="private">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <UserRound className="h-5 w-5 mr-2" />
              Private Courses
            </h3>
            {renderCourseTypeButtons(privateTypes)}
          </TabsContent>

          <TabsContent value="group">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Group Courses
            </h3>
            {renderCourseTypeButtons(groupTypes)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
