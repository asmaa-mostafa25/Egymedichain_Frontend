import { useEffect, useState, useRef } from 'react';
import { User, Upload, Save, Loader2 } from 'lucide-react';
import { useUIStore, useNotificationStore, useAuthStore } from '../../store';
import { settingsApi } from '../../api';
import Button from '../../components/ui/Button';

const ProfilePage = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError } = useNotificationStore();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
  });

  useEffect(() => {
    setPageTitle('Profile');
    setBreadcrumbs(['Home', 'Settings', 'Profile']);
    fetchProfile();
  }, []);

  useEffect(() => {
    setAvatarPreview(user?.avatar || '');
    setProfile((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
    }));
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      if (response.success && response.data?.profile) {
        setProfile((prev) => ({ ...prev, ...response.data.profile }));
      }
    } catch (err) {
      // fallback to defaults silently
    } finally {
      setLoading(false);
    }
  };

  // === Avatar: يتحفظ فورًا لحظة الاختيار، مش بعد الضغط على Save ===
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('من فضلك اختر ملف صورة');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showError('حجم الصورة كبير جدًا (الحد الأقصى 3MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const nextAvatar = String(reader.result);
      setAvatarPreview(nextAvatar); // Optimistic UI

      try {
        setAvatarUploading(true);
        const response = await settingsApi.update({
          profile: { ...profile, avatar: nextAvatar },
        });

        if (response.success) {
          // بنحدث الـ authStore فورًا -> أي مكان في التطبيق بيقرا user.avatar
          // (الهيدر، السايدبار، إلخ) هيتحدث لحظيًا من غير ما نحتاج Save
          setUser({ ...user, avatar: nextAvatar });
          success('تم تحديث الصورة الشخصية');
        } else {
          throw new Error(response.message || 'فشل تحديث الصورة');
        }
      } catch (err) {
        setAvatarPreview(user?.avatar || ''); // رجّع القديمة لو فشل
        showError(err.message || 'حصل خطأ أثناء رفع الصورة');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const payload = { profile: { ...profile, avatar: avatarPreview } };
      const response = await settingsApi.update(payload);

      if (response.success) {
        setUser({ ...user, ...payload.profile });
        success('تم حفظ بيانات البروفيل بنجاح');
      } else {
        throw new Error(response.message || 'فشل الحفظ');
      }
    } catch (err) {
      showError(err.message || 'حصل خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            Profile
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            بيانات حسابك الشخصية وصورة الأدمن
          </p>
        </div>
        <Button variant="primary" leftIcon={Save} onClick={handleSaveProfile} loading={loading}>
          حفظ التغييرات
        </Button>
      </div>

      <div
        style={{
          padding: 'var(--spacing-xl)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          maxWidth: '640px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '96px',
              height: '96px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              backgroundColor: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              flexShrink: 0,
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Admin avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{profile.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
            )}

            {avatarUploading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Loader2 size={22} className="animate-spin" color="#fff" />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              الصورة الشخصية
            </div>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              الصورة بتتحفظ تلقائيًا فور اختيارها، وبتظهر فورًا في كل أماكن التطبيق (الهيدر، السايدبار، ...إلخ)
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                cursor: avatarUploading ? 'not-allowed' : 'pointer',
                opacity: avatarUploading ? 0.6 : 1,
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <Upload size={16} />
              {avatarUploading ? 'جاري الرفع...' : 'اختيار صورة'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            الاسم بالكامل
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="+20 XXX XXX XXXX"
            style={inputStyle}
          />
        </div>

        {/* Department */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            القسم
          </label>
          <select
            value={profile.department}
            onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
            style={inputStyle}
          >
            <option value="">اختر القسم</option>
            <option value="operations">Operations</option>
            <option value="compliance">Compliance</option>
            <option value="logistics">Logistics</option>
            <option value="administration">Administration</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
};

export default ProfilePage;