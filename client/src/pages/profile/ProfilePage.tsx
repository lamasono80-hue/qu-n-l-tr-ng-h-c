import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Edit3, Plus, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { StudentProfileDetail, SkillItem, CourseItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, refreshProfile } = useAuth();

  const isMyProfile = !userId || userId === 'me' || userId === currentUser?.id;

  const [profile, setProfile] = useState<StudentProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [campus, setCampus] = useState('');
  const [major, setMajor] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [skillsCatalog, setSkillsCatalog] = useState<SkillItem[]>([]);
  const [coursesCatalog, setCoursesCatalog] = useState<CourseItem[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = isMyProfile
        ? await profileService.getMyProfile()
        : await profileService.getUserProfile(userId!);

      if (res.data) {
        setProfile(res.data);
        setFullName(res.data.full_name || '');
        setCampus(res.data.campus || '');
        setMajor(res.data.major || '');
        setYearOfStudy(res.data.year_of_study || 1);
        setBio(res.data.bio || '');
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, isMyProfile]);

  const openSkillModal = async () => {
    try {
      const res = await profileService.getSkillsCatalog();
      if (res.data) {
        setSkillsCatalog(res.data);
        if (res.data.length > 0) setSelectedSkillId(res.data[0].id);
      }
    } catch {
      // ignore
    }
    setIsSkillModalOpen(true);
  };

  const openCourseModal = async () => {
    try {
      const res = await profileService.getCoursesCatalog();
      if (res.data) {
        setCoursesCatalog(res.data);
        if (res.data.length > 0) setSelectedCourseId(res.data[0].id);
      }
    } catch {
      // ignore
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await profileService.updateMyProfile({
        full_name: fullName.trim(),
        campus: campus.trim() || null,
        major: major.trim() || null,
        year_of_study: Number(yearOfStudy),
        bio: bio.trim() || null,
      });
      await refreshProfile();
      await fetchProfile();
      setIsEditModalOpen(false);
    } catch {
      // ignore
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSkill = async () => {
    if (!profile || !selectedSkillId) return;
    const existing = profile.skills.map((s) => ({
      skill_id: s.skill_id,
      proficiency_level: s.proficiency_level,
    }));

    if (existing.some((s) => s.skill_id === selectedSkillId)) {
      alert('Kỹ năng này đã có trong hồ sơ của bạn.');
      return;
    }

    const updated = [...existing, { skill_id: selectedSkillId, proficiency_level: selectedProficiency }];
    await profileService.updateMySkills(updated);
    await refreshProfile();
    await fetchProfile();
    setIsSkillModalOpen(false);
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!profile) return;
    const updated = profile.skills
      .filter((s) => s.skill_id !== skillId)
      .map((s) => ({ skill_id: s.skill_id, proficiency_level: s.proficiency_level }));
    await profileService.updateMySkills(updated);
    await refreshProfile();
    await fetchProfile();
  };

  const handleAddCourse = async () => {
    if (!profile || !selectedCourseId) return;
    const existing = profile.courses.map((c) => ({ course_id: c.course_id }));
    if (existing.some((c) => c.course_id === selectedCourseId)) {
      alert('Môn học này đã có trong hồ sơ của bạn.');
      return;
    }
    const updated = [...existing, { course_id: selectedCourseId }];
    await profileService.updateMyCourses(updated);
    await refreshProfile();
    await fetchProfile();
    setIsCourseModalOpen(false);
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!profile) return;
    const updated = profile.courses
      .filter((c) => c.course_id !== courseId)
      .map((c) => ({ course_id: c.course_id }));
    await profileService.updateMyCourses(updated);
    await refreshProfile();
    await fetchProfile();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-slate-500">
        Không tìm thấy thông tin hồ sơ sinh viên.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-2xl border-2 border-indigo-200">
                {(profile.full_name || profile.email)[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.full_name || 'Chưa cập nhật tên'}</h1>
                {profile.is_profile_complete ? (
                  <span title="Hồ sơ hoàn thiện (BR-001)">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </span>
                ) : (
                  <span title="Chưa hoàn thiện (BR-001)">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile.major && <Badge variant="blue">{profile.major}</Badge>}
                {profile.year_of_study && <Badge variant="slate">Năm {profile.year_of_study}</Badge>}
                {profile.campus && <Badge variant="gray">{profile.campus}</Badge>}
              </div>
            </div>
          </div>

          {isMyProfile && (
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit3 className="w-4 h-4 mr-1.5" /> Chỉnh sửa hồ sơ
            </Button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu bản thân</h4>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {profile.bio || 'Sinh viên chưa cập nhật phần giới thiệu.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Kỹ năng & Mức độ thành thạo</h3>
          </div>
          {isMyProfile && (
            <Button variant="outline" size="sm" onClick={openSkillModal}>
              <Plus className="w-4 h-4 mr-1" /> Thêm kỹ năng
            </Button>
          )}
        </div>

        {profile.skills.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có kỹ năng nào được thêm.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {profile.skills.map((s) => (
              <div
                key={s.skill_id}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              >
                <span>{s.skill_name}</span>
                <Badge
                  variant={
                    s.proficiency_level === 'ADVANCED'
                      ? 'green'
                      : s.proficiency_level === 'INTERMEDIATE'
                      ? 'blue'
                      : 'slate'
                  }
                  size="sm"
                >
                  {s.proficiency_level === 'ADVANCED'
                    ? 'Thành thạo'
                    : s.proficiency_level === 'INTERMEDIATE'
                    ? 'Khá'
                    : 'Mới bắt đầu'}
                </Badge>
                {isMyProfile && (
                  <button
                    onClick={() => handleRemoveSkill(s.skill_id)}
                    className="text-slate-400 hover:text-red-500 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Môn học quan tâm / Đã học</h3>
          </div>
          {isMyProfile && (
            <Button variant="outline" size="sm" onClick={openCourseModal}>
              <Plus className="w-4 h-4 mr-1" /> Thêm môn học
            </Button>
          )}
        </div>

        {profile.courses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có môn học nào được thêm.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.courses.map((c) => (
              <div
                key={c.course_id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div>
                  <span className="text-xs font-bold text-indigo-600 block">{c.course_code}</span>
                  <span className="text-sm font-medium text-slate-800">{c.course_name}</span>
                </div>
                {isMyProfile && (
                  <button
                    onClick={() => handleRemoveCourse(c.course_id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Chỉnh sửa hồ sơ cá nhân">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input label="Họ và tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Cơ sở / Campus" placeholder="VD: Cơ sở 1 - Dĩ An, Bình Dương" value={campus} onChange={(e) => setCampus(e.target.value)} />
          <Input label="Khoa / Chuyên ngành" placeholder="VD: Khoa học Máy tính" value={major} onChange={(e) => setMajor(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Năm học</label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>Năm 1</option>
              <option value={2}>Năm 2</option>
              <option value={3}>Năm 3</option>
              <option value={4}>Năm 4</option>
              <option value={5}>Năm 5+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Giới thiệu bản thân (Bio)</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Giới thiệu về mục tiêu học tập, định hướng nghề nghiệp hoặc phong cách làm việc..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit" isLoading={isSavingProfile}>Lưu thay đổi</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Thêm kỹ năng vào hồ sơ">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn kỹ năng</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {skillsCatalog.map((sk) => (
                <option key={sk.id} value={sk.id}>{sk.name} ({sk.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ thành thạo</label>
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BEGINNER">Mới bắt đầu (Beginner)</option>
              <option value="INTERMEDIATE">Khá (Intermediate)</option>
              <option value="ADVANCED">Thành thạo (Advanced)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsSkillModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleAddSkill}>Thêm kỹ năng</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Thêm môn học vào hồ sơ">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn môn học</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {coursesCatalog.map((co) => (
                <option key={co.id} value={co.id}>{co.course_code} - {co.course_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCourseModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleAddCourse}>Thêm môn học</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
