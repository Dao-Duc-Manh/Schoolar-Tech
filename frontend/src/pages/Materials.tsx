import { Card, CardHeader, CardBody } from '@/components/Common';

export function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Course Materials</h1>
        <p className="text-gray-600 mt-2">Upload and manage course materials</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Materials</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">Materials management coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
}
