import { FC, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileSettings: FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // API call to update profile
      console.log('Saving profile:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Profile Settings</h2>

      {/* Profile Info */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginTop: 0 }}>Profile Information</h3>

        {!isEditing ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Name
              </label>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.name}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Email
              </label>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.email}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginTop: 0 }}>Preferences</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <input type="checkbox" id="notifications" defaultChecked />
          <label htmlFor="notifications" style={{ cursor: 'pointer' }}>
            Enable email notifications
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="checkbox" id="analytics" defaultChecked />
          <label htmlFor="analytics" style={{ cursor: 'pointer' }}>
            Share meeting analytics
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        borderLeft: '4px solid rgb(239, 68, 68)',
      }}>
        <h3 style={{ marginTop: 0, color: 'rgb(239, 68, 68)' }}>Danger Zone</h3>
        <button 
          className="btn"
          style={{
            background: 'rgb(239, 68, 68)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              logout();
            }
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
