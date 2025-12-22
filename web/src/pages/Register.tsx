import { useState } from 'react';
import type { User } from '../types';
import { Input } from '../ui/Input';
import axiosClient from '../api/axiosClient';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
  selectedRole: 'patient' | 'doctor';
  onBackToRoleSelection: () => void;
}

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  gender?: string;
  birthdate?: string;
  specialty?: string;
}

const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan' },
  { code: '+213', country: 'Algeria' },
  { code: '+376', country: 'Andorra' },
  { code: '+54', country: 'Argentina' },
  { code: '+374', country: 'Armenia' },
  { code: '+61', country: 'Australia' },
  { code: '+43', country: 'Austria' },
  { code: '+994', country: 'Azerbaijan' },
  { code: '+973', country: 'Bahrain' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+375', country: 'Belarus' },
  { code: '+32', country: 'Belgium' },
  { code: '+501', country: 'Belize' },
  { code: '+229', country: 'Benin' },
  { code: '+975', country: 'Bhutan' },
  { code: '+591', country: 'Bolivia' },
  { code: '+387', country: 'Bosnia and Herzegovina' },
  { code: '+55', country: 'Brazil' },
  { code: '+673', country: 'Brunei' },
  { code: '+359', country: 'Bulgaria' },
  { code: '+226', country: 'Burkina Faso' },
  { code: '+257', country: 'Burundi' },
  { code: '+855', country: 'Cambodia' },
  { code: '+237', country: 'Cameroon' },
  { code: '+1', country: 'Canada' },
  { code: '+56', country: 'Chile' },
  { code: '+86', country: 'China' },
  { code: '+57', country: 'Colombia' },
  { code: '+269', country: 'Comoros' },
  { code: '+682', country: 'Cook Islands' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+385', country: 'Croatia' },
  { code: '+53', country: 'Cuba' },
  { code: '+357', country: 'Cyprus' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+45', country: 'Denmark' },
  { code: '+253', country: 'Djibouti' },
  { code: '+503', country: 'El Salvador' },
  { code: '+20', country: 'Egypt' },
  { code: '+372', country: 'Estonia' },
  { code: '+251', country: 'Ethiopia' },
  { code: '+358', country: 'Finland' },
  { code: '+33', country: 'France' },
  { code: '+594', country: 'French Guiana' },
  { code: '+689', country: 'French Polynesia' },
  { code: '+500', country: 'Falkland Islands' },
  { code: '+679', country: 'Fiji' },
  { code: '+995', country: 'Georgia' },
  { code: '+49', country: 'Germany' },
  { code: '+233', country: 'Ghana' },
  { code: '+30', country: 'Greece' },
  { code: '+590', country: 'Guadeloupe' },
  { code: '+502', country: 'Guatemala' },
  { code: '+224', country: 'Guinea' },
  { code: '+245', country: 'Guinea-Bissau' },
  { code: '+592', country: 'Guyana' },
  { code: '+509', country: 'Haiti' },
  { code: '+504', country: 'Honduras' },
  { code: '+852', country: 'Hong Kong' },
  { code: '+36', country: 'Hungary' },
  { code: '+354', country: 'Iceland' },
  { code: '+91', country: 'India' },
  { code: '+62', country: 'Indonesia' },
  { code: '+98', country: 'Iran' },
  { code: '+964', country: 'Iraq' },
  { code: '+353', country: 'Ireland' },
  { code: '+972', country: 'Israel' },
  { code: '+39', country: 'Italy' },
  { code: '+81', country: 'Japan' },
  { code: '+962', country: 'Jordan' },
  { code: '+996', country: 'Kyrgyzstan' },
  { code: '+686', country: 'Kiribati' },
  { code: '+82', country: 'South Korea' },
  { code: '+850', country: 'North Korea' },
  { code: '+383', country: 'Kosovo' },
  { code: '+965', country: 'Kuwait' },
  { code: '+371', country: 'Latvia' },
  { code: '+961', country: 'Lebanon' },
  { code: '+266', country: 'Lesotho' },
  { code: '+231', country: 'Liberia' },
  { code: '+218', country: 'Libya' },
  { code: '+423', country: 'Liechtenstein' },
  { code: '+370', country: 'Lithuania' },
  { code: '+352', country: 'Luxembourg' },
  { code: '+853', country: 'Macao' },
  { code: '+389', country: 'North Macedonia' },
  { code: '+261', country: 'Madagascar' },
  { code: '+265', country: 'Malawi' },
  { code: '+60', country: 'Malaysia' },
  { code: '+960', country: 'Maldives' },
  { code: '+223', country: 'Mali' },
  { code: '+356', country: 'Malta' },
  { code: '+692', country: 'Marshall Islands' },
  { code: '+596', country: 'Martinique' },
  { code: '+222', country: 'Mauritania' },
  { code: '+230', country: 'Mauritius' },
  { code: '+52', country: 'Mexico' },
  { code: '+691', country: 'Micronesia' },
  { code: '+373', country: 'Moldova' },
  { code: '+377', country: 'Monaco' },
  { code: '+976', country: 'Mongolia' },
  { code: '+382', country: 'Montenegro' },
  { code: '+212', country: 'Morocco' },
  { code: '+258', country: 'Mozambique' },
  { code: '+95', country: 'Myanmar' },
  { code: '+264', country: 'Namibia' },
  { code: '+674', country: 'Nauru' },
  { code: '+977', country: 'Nepal' },
  { code: '+31', country: 'Netherlands' },
  { code: '+599', country: 'Netherlands Antilles' },
  { code: '+64', country: 'New Zealand' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+227', country: 'Niger' },
  { code: '+234', country: 'Nigeria' },
  { code: '+47', country: 'Norway' },
  { code: '+968', country: 'Oman' },
  { code: '+92', country: 'Pakistan' },
  { code: '+680', country: 'Palau' },
  { code: '+970', country: 'Palestine' },
  { code: '+507', country: 'Panama' },
  { code: '+675', country: 'Papua New Guinea' },
  { code: '+595', country: 'Paraguay' },
  { code: '+51', country: 'Peru' },
  { code: '+63', country: 'Philippines' },
  { code: '+48', country: 'Poland' },
  { code: '+351', country: 'Portugal' },
  { code: '+974', country: 'Qatar' },
  { code: '+40', country: 'Romania' },
  { code: '+7', country: 'Russia' },
  { code: '+250', country: 'Rwanda' },
  { code: '+378', country: 'San Marino' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+221', country: 'Senegal' },
  { code: '+381', country: 'Serbia' },
  { code: '+248', country: 'Seychelles' },
  { code: '+232', country: 'Sierra Leone' },
  { code: '+65', country: 'Singapore' },
  { code: '+386', country: 'Slovenia' },
  { code: '+677', country: 'Solomon Islands' },
  { code: '+252', country: 'Somalia' },
  { code: '+27', country: 'South Africa' },
  { code: '+34', country: 'Spain' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+508', country: 'Saint Pierre and Miquelon' },
  { code: '+249', country: 'Sudan' },
  { code: '+597', country: 'Suriname' },
  { code: '+268', country: 'Eswatini' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+963', country: 'Syria' },
  { code: '+886', country: 'Taiwan' },
  { code: '+992', country: 'Tajikistan' },
  { code: '+255', country: 'Tanzania' },
  { code: '+66', country: 'Thailand' },
  { code: '+670', country: 'East Timor' },
  { code: '+228', country: 'Togo' },
  { code: '+676', country: 'Tonga' },
  { code: '+690', country: 'Tokelau' },
  { code: '+216', country: 'Tunisia' },
  { code: '+90', country: 'Turkey' },
  { code: '+993', country: 'Turkmenistan' },
  { code: '+688', country: 'Tuvalu' },
  { code: '+256', country: 'Uganda' },
  { code: '+380', country: 'Ukraine' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+1', country: 'United States' },
  { code: '+598', country: 'Uruguay' },
  { code: '+998', country: 'Uzbekistan' },
  { code: '+678', country: 'Vanuatu' },
  { code: '+58', country: 'Venezuela' },
  { code: '+84', country: 'Vietnam' },
  { code: '+681', country: 'Wallis and Futuna' },
  { code: '+967', country: 'Yemen' },
  { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabwe' },
];

const SPECIALTIES = [
  'Internal Medicine',
  'Cardiology',
  'Pulmonology / Respiratory Medicine',
  'Nephrology',
  'Endocrinology & Metabolism',
  'Gastroenterology',
  'Neurology',
  'General Surgery',
  'Orthopedics & Traumatology',
  'Obstetrics & Gynecology',
  'Pediatrics',
  'Emergency Medicine',
  'Family Medicine / General Practice',
  'Psychiatry',
  'Radiology',
  'Anesthesiology & Reanimation',
  'Oncology',
  'Infectious Diseases',
  'Dermatology',
  'Rheumatology',
];

export function Register({ onRegister, onSwitchToLogin, selectedRole, onBackToRoleSelection }: RegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+1',
    phoneNumber: '',
    gender: '',
    birthdate: '',
    role: selectedRole,
    specialty: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDoctorApprovalMessage, setShowDoctorApprovalMessage] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(req => req);

  const filteredCountries = COUNTRY_CODES.filter(
    ({ code, country }) =>
      country.toLowerCase().includes(countrySearch.toLowerCase()) ||
      code.includes(countrySearch)
  );

  const filteredSpecialties = SPECIALTIES.filter(specialty =>
    specialty.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const selectedCountry = COUNTRY_CODES.find(c => c.code === formData.countryCode);

  const handleSelectCountry = (code: string) => {
    setFormData({ ...formData, countryCode: code });
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
  };

  const handleSelectSpecialty = (specialty: string) => {
    setFormData({ ...formData, specialty });
    setIsSpecialtyDropdownOpen(false);
    setSpecialtySearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation - only business logic checks, browser handles required fields
    if (formData.role === 'patient') {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (actualAge < 18) {
        setError('You must be at least 18 years old to register');
        setIsLoading(false);
        return;
      }
    }
    if (formData.role === 'doctor' && !formData.specialty) {
      setError('Please select a specialty');
      setIsLoading(false);
      return;
    }
    if (formData.role === 'doctor' && !formData.email.endsWith('@cdpa.com')) {
      setError('Doctor email must end with @cdpa.com');
      setIsLoading(false);
      return;
    }
    if (!isPasswordStrong) {
      setError('Password does not meet all requirements');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      const response = await axiosClient.post<AuthResponse>('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: fullPhone,
        gender: formData.gender,
        birthdate: formData.birthdate,
        role: formData.role,
        specialty: formData.role === 'doctor' ? formData.specialty : null,
      });

      const { token, firstName, lastName, email, role, phone, gender, birthdate, specialty } = response.data;
      
      // If doctor, show approval waiting message instead of logging in
      if (role.toLowerCase() === 'doctor') {
        setShowDoctorApprovalMessage(true);
        return;
      }
      
      // For patients, proceed with normal login
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);

      const user: User = {
        id: email,
        name: `${firstName} ${lastName}`,
        email,
        role: role as any,
        phone,
        gender,
        birthdate,
        specialty,
      };

      onRegister(user);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Email already exists or invalid data');
      } else {
        setError('Connection failed. Please make sure the API server is running on http://localhost:5172');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">

      {/* Doctor Approval Pending Message */}
      {showDoctorApprovalMessage ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h2>
            <p className="text-gray-700 mb-2">Your doctor account has been created.</p>
            <p className="text-gray-600 text-sm mb-6">
              Please wait for admin approval before you can access the system. 
              You will be able to log in once an administrator approves your account.
            </p>
          </div>
          <button
            onClick={onSwitchToLogin}
            className="px-8 py-2.5 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      ) : (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full max-w-2xl relative z-10">
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-medical-500 text-center flex-1 text-2xl font-bold">
            Create {selectedRole === 'doctor' ? 'Doctor' : 'Patient'} Account
          </h1>
          <button
            type="button"
            onClick={onBackToRoleSelection}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">

          <div className="grid grid-cols-2 gap-10">
            <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
          </div>

          {selectedRole === 'doctor' && (
            <div className="w-full">
              <label className="block text-gray-400 mb-1 text-xs">Specialty *</label>
              <div className="relative">
                <div
                  onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                  className="w-full px-2 py-2 border-b-2 border-medical-300 bg-transparent text-sm cursor-pointer focus-within:border-medical-500 flex items-center justify-between"
                >
                  <span className={formData.specialty ? 'text-gray-900' : 'text-gray-400'}>
                    {formData.specialty || 'Select specialty'}
                  </span>
                  <span className="text-gray-400">▼</span>
                </div>
                
                {isSpecialtyDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search specialty..."
                        value={specialtySearch}
                        onChange={e => setSpecialtySearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-medical-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredSpecialties.length > 0 ? (
                        filteredSpecialties.map((specialty, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectSpecialty(specialty)}
                            className="px-3 py-2 hover:bg-medical-50 cursor-pointer text-sm"
                          >
                            {specialty}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No specialties found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="w-full">
            <Input label="Email Address *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <label className="block text-gray-400 mb-1 text-xs">Gender *</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-2 py-2 border-b-2 border-medical-300 bg-transparent text-sm focus:outline-none focus:border-medical-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <Input
              label="Birthdate *"
              type="date"
              value={formData.birthdate}
              onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
              required
            />
          </div>

          {/* Phone row – same width as First Name */}
          <div className="w-full">
            <div>
              <label className="block text-gray-400 mb-1 text-xs">
                Phone Number *
              </label>
              <div className="flex gap-10">
                <div className="w-72 relative">
                  <div
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="px-2 py-2 border-b-2 border-medical-300 bg-transparent text-sm cursor-pointer focus-within:border-medical-500 flex items-center justify-between"
                  >
                    <span>{selectedCountry?.code} {selectedCountry?.country}</span>
                    <span className="text-gray-400">▼</span>
                  </div>
                  
                  {isCountryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-medical-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map(({ code, country }, index) => (
                            <div
                              key={`${code}-${index}`}
                              onClick={() => handleSelectCountry(code)}
                              className="px-3 py-2 hover:bg-medical-50 cursor-pointer text-sm"
                            >
                              {code} {country}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={e => {
                    const value = e.target.value;
                    // Only allow digits
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData({ ...formData, phoneNumber: value });
                    }
                  }}
                  className="flex-1 px-2 py-2 border-b-2 border-medical-300 bg-transparent text-sm
                            focus:outline-none focus:border-medical-500"
                  pattern="\d{10}"
                  title="Phone number must be exactly 10 digits"
                  maxLength={10}
                  minLength={10}
                  required
                />
              </div>
            </div>

            {/* second column left empty for now, keeps layout aligned */}
            <div />
          </div>



          

          <div className="grid grid-cols-2 gap-10">
            <div>
              <label className="block text-gray-400 mb-1 text-xs">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordRequirements(true)}
                  className="w-full px-2 py-2 pr-10 border-b-2 border-medical-300 bg-transparent text-sm focus:outline-none focus:border-medical-500"
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-xs">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-2 py-2 pr-10 border-b-2 border-medical-300 bg-transparent text-sm focus:outline-none focus:border-medical-500"
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowConfirmPassword(true)}
                  onMouseUp={() => setShowConfirmPassword(false)}
                  onMouseLeave={() => setShowConfirmPassword(false)}
                  onTouchStart={() => setShowConfirmPassword(true)}
                  onTouchEnd={() => setShowConfirmPassword(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          {showPasswordRequirements && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-2">
              <p className="font-semibold text-gray-700 mb-2">Password must contain:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passwordRequirements.minLength ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passwordRequirements.hasUpperCase ? '✓' : '○'}</span>
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passwordRequirements.hasLowerCase ? '✓' : '○'}</span>
                  <span>At least 1 lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                  <span>At least 1 number (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span>
                  <span>At least 1 special character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button type="submit" disabled={isLoading} className="px-12 py-2.5 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all text-sm font-medium disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-medical-500 font-semibold hover:text-medical-600 hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
      )}

    </div>
  );
}
