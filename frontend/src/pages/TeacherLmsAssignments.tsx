import { useEffect, useMemo, useState } from 'react';
import { learningService } from '@/services/learningService';
import { Toast } from '@/components/Common/Toast';

type Assignment = {
  id: string;
  title: string;
  dueDate?: string;
  maxScore?: number;
  problemFileUrl?: string;
};

type Submission = {
  id: string;
  studentId: string;
  studentName?: string;
  answerFileUrl?: string;
  submittedAt?: string;
  status?: string;
  score?: number | null;
  feedback?: string | null;
};

export function TeacherLmsAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);

  // MVP: giả định classId lấy từ lớp đầu tiên của teacher
  // (chưa dùng trong MVP UI)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeClassId: string | null = null;
  void activeClassId;

  const [activeAssignmentId, setActiveAssignmentId] = useState<string>('');


  const activeAssignment = useMemo(
    () => assignments.find((a) => a.id === activeAssignmentId) ?? null,
    [assignments, activeAssignmentId]
  );

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'upload'>('manual');

  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: '10',
  });

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: '10',
    file: null as File | null,
  });

  useEffect(() => {

    let mounted = true;

    async function load() {
      try {
        if (!mounted) return;
        // MVP UI: placeholder (backend endpoints sẽ được thêm ở bước tiếp theo)
        setAssignments([]);
        setActiveAssignmentId('');
      } catch (e: any) {
        if (!mounted) return;
        setToast({
          type: 'error',
          title: 'Không tải được bài tập',
          description: e?.response?.data?.message || e?.message,
        });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeAssignmentId) return;

    async function loadSub() {
      try {
        setTeacherLoading(true);
        // placeholder: khi backend có endpoint /teacher/assignments/:id/submissions
        setSubmissions([]);
      } catch (e: any) {
        setToast({
          type: 'error',
          title: 'Không tải được bài nộp',
          description: e?.response?.data?.message || e?.message,
        });
      } finally {
        setTeacherLoading(false);
      }
    }

    loadSub();
  }, [activeAssignmentId]);

  // MVP UI chưa liên kết API: học service không có methods teacherAssignments/teacherSubmissions/gradeSubmission
  // nên tạm thời giữ submissions rỗng cho đến khi backend endpoint được triển khai.

  const [gradingDraft, setGradingDraft] = useState<Record<string, { score: string; feedback: string }>>({});

  const handleOpenDraft = (submission: Submission) => {
    setGradingDraft((prev) => ({
      ...prev,
      [submission.id]: {
        score: submission.score !== null && submission.score !== undefined ? String(submission.score) : '',
        feedback: submission.feedback ?? '',
      },
    }));
  };

  const handleSaveGrade = async (submission: Submission) => {
    // MVP placeholder: endpoint teacher chấm sẽ được thêm ở bước backend.
    // Hiện tại chỉ đóng vai trò giao diện.
    console.log('gradeSubmission placeholder', submission.id);

    const draft = gradingDraft[submission.id];
    if (!draft) return;

    const scoreNum = Number(draft.score);
    if (Number.isNaN(scoreNum)) {
      setToast({ type: 'error', title: 'Điểm không hợp lệ', description: 'Vui lòng nhập số.' });
      return;
    }

    try {
      setTeacherLoading(true);
      // @ts-expect-error - MVP placeholder: backend chưa có endpoint gradeSubmission
      await learningService.gradeSubmission?.({
        submissionId: submission.id,
        score: scoreNum,
        feedback: draft.feedback,
      });

      setToast({ type: 'success', title: 'Đã chấm bài', description: submission.studentName ?? '' });

      // reload submissions
      // @ts-expect-error - MVP placeholder: backend chưa có endpoint teacherSubmissions
      const data = await learningService.teacherSubmissions?.(activeAssignmentId);

      setSubmissions(data ?? []);
    } catch (e: any) {
      setToast({
        type: 'error',
        title: 'Chấm bài thất bại',
        description: e?.response?.data?.message || e?.message,
      });
    } finally {
      setTeacherLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải Teacher LMS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Teacher LMS</p>
        <h1 className="mt-4 text-4xl font-extrabold">Bài tập & Bài nộp</h1>
        <p className="mt-3 text-white/80">Giảng viên tạo đề, xem bài nộp, chấm điểm và tải file để chấm.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30 xl:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold">Danh sách bài tập</h2>
            <button
              className="shrink-0 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition"
              onClick={() => setShowAddForm(true)}
            >
              + Thêm bài tập
            </button>
          </div>

          <div className="mt-4 space-y-3">

            {assignments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Chưa có assignment.</p>
            ) : (
              assignments.map((a) => (
                <button
                  key={a.id}
                  className={
                    'w-full text-left rounded-2xl p-4 border transition ' +
                    (a.id === activeAssignmentId
                      ? 'border-primary bg-primary-50'
                      : 'border-outline-variant/30 bg-white hover:bg-surface-container-low')
                  }
                  onClick={() => setActiveAssignmentId(a.id)}
                >
                  <p className="font-bold">{a.title}</p>
                  {a.dueDate && (
                    <p className="text-xs text-on-surface-variant mt-1">Deadline: {new Date(a.dueDate).toLocaleString()}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Bài nộp</h2>
              {activeAssignment ? (
                <p className="text-sm text-on-surface-variant mt-2">{activeAssignment.title}</p>
              ) : (
                <p className="text-sm text-on-surface-variant mt-2">Chọn một bài tập để xem</p>
              )}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant">
                  <th className="p-3">Sinh viên</th>
                  <th className="p-3">Nộp lúc</th>
                  <th className="p-3">File nộp</th>
                  <th className="p-3">Điểm</th>
                  <th className="p-3">Nhận xét</th>
                  <th className="p-3">Chấm</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-on-surface-variant">
                      {activeAssignmentId ? 'Chưa có bài nộp.' : 'Chưa chọn assignment.'}
                    </td>
                  </tr>
                ) : (
                  submissions.map((s) => {
                    const draft = gradingDraft[s.id];
                    return (
                      <tr key={s.id} className="border-t border-outline-variant/20 align-top">
                        <td className="p-3 font-bold">{s.studentName ?? s.studentId}</td>
                        <td className="p-3 text-on-surface-variant">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}</td>
                        <td className="p-3">
                          {s.answerFileUrl ? (
                            <a className="text-primary font-bold underline" href={s.answerFileUrl} target="_blank" rel="noreferrer">
                              Tải file
                            </a>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                          <div>
                            <button
                              className="mt-2 text-xs font-bold text-on-surface-variant hover:text-primary"
                              onClick={() => handleOpenDraft(s)}
                            >
                              Nhập điểm
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            className="input"
                            value={draft?.score ?? (s.score ?? '')}
                            onChange={(e) =>
                      setGradingDraft((prev) => ({
                                ...prev,
                                [s.id]: {
                                  score: e.target.value,
                                  feedback: prev[s.id]?.feedback ?? s.feedback ?? '',
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="p-3">
                          <textarea
                            className="input min-h-[80px]"
                            value={draft?.feedback ?? (s.feedback ?? '')}
                            onChange={(e) =>
                              setGradingDraft((prev) => ({
                                ...prev,
                                [s.id]: {
                                  score: prev[s.id]?.score ?? (s.score ?? '').toString(),
                                  feedback: e.target.value,
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="p-3">
                          <button
                            className="btn-primary"
                            disabled={teacherLoading}
                            onClick={() => handleSaveGrade(s)}
                          >
                            Chấm
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {teacherLoading && (
            <div className="mt-4 text-sm text-on-surface-variant">Đang xử lý...</div>
          )}
        </div>
      </section>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Thêm bài tập</h2>
                <p className="text-sm text-on-surface-variant mt-1">Chọn 1 trong 2 hình thức: gõ tay hoặc upload file.</p>
              </div>
              <button
                className="rounded-xl border border-outline-variant/30 px-3 py-1 font-bold hover:bg-surface-container-low"
                onClick={() => setShowAddForm(false)}
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 flex gap-2 bg-surface-container-low p-1 rounded-2xl">
              <button
                className={
                  'flex-1 rounded-2xl px-4 py-2 text-sm font-bold transition ' +
                  (addMode === 'manual' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-white')
                }
                onClick={() => setAddMode('manual')}
              >
                Gõ tay
              </button>
              <button
                className={
                  'flex-1 rounded-2xl px-4 py-2 text-sm font-bold transition ' +
                  (addMode === 'upload' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-white')
                }
                onClick={() => setAddMode('upload')}
              >
                Upload file
              </button>
            </div>

            {addMode === 'manual' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-bold">Tiêu đề</label>
                  <input
                    className="input w-full"
                    value={manualForm.title}
                    onChange={(e) => setManualForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ví dụ: Bài tập tuần 5"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Nội dung/đề bài (text)</label>
                  <textarea
                    className="input min-h-[120px] w-full"
                    value={manualForm.description}
                    onChange={(e) => setManualForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Nhập đề bài bằng text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold">Deadline</label>
                    <input
                      className="input w-full"
                      type="datetime-local"
                      value={manualForm.dueDate}
                      onChange={(e) => setManualForm((p) => ({ ...p, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Điểm tối đa</label>
                    <input
                      className="input w-full"
                      type="number"
                      value={manualForm.maxScore}
                      onChange={(e) => setManualForm((p) => ({ ...p, maxScore: e.target.value }))}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setToast({
                      type: 'info',
                      title: 'Chưa liên kết API',
                      description: 'Hiện tại hệ thống chưa triển khai endpoint tạo assignment. Bạn có thể tiếp tục kiểm tra UI.',
                    });
                    setShowAddForm(false);
                  }}
                >
                  Tạo bài tập (gõ tay)
                </button>
              </div>
            )}

            {addMode === 'upload' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-bold">Tiêu đề</label>
                  <input
                    className="input w-full"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ví dụ: Đề Lab 03"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Mô tả (tùy chọn)</label>
                  <textarea
                    className="input min-h-[90px] w-full"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả ngắn hoặc hướng dẫn..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold">Deadline</label>
                    <input
                      className="input w-full"
                      type="datetime-local"
                      value={uploadForm.dueDate}
                      onChange={(e) => setUploadForm((p) => ({ ...p, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Điểm tối đa</label>
                    <input
                      className="input w-full"
                      type="number"
                      value={uploadForm.maxScore}
                      onChange={(e) => setUploadForm((p) => ({ ...p, maxScore: e.target.value }))}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold">Tệp đề (upload file)</label>
                  <div className="mt-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                    <input
                      className="block w-full text-sm"
                      type="file"
                      accept="application/pdf,.ppt,.pptx,.doc,.docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setUploadForm((p) => ({ ...p, file: f }));
                      }}
                    />
                    <p className="text-xs text-on-surface-variant mt-2">
                      {uploadForm.file ? `Đã chọn: ${uploadForm.file.name}` : 'Chưa chọn file nào'}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    UI MVP: backend upload assignment sẽ được nối ở bước tiếp theo.
                  </p>
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setToast({
                      type: 'info',
                      title: 'Chưa liên kết API',
                      description: 'Hiện tại hệ thống chưa triển khai endpoint tạo assignment. Bạn có thể tiếp tục kiểm tra UI.' ,
                    });
                    setShowAddForm(false);
                  }}
                  disabled={!uploadForm.file}
                >
                  Tạo bài tập (upload file)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {toast && (

        <Toast
          open={true}
          type={toast.type}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

