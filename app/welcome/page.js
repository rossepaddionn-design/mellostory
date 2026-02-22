'use client';
import '@/app/fonts.css';
import { User, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ nickname: '', email: '', password: '' });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmMessage, setConfirmMessage] = useState('');
const [confirmAction, setConfirmAction] = useState(null);

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

 const handleRegister = async () => {
  if (!authForm.nickname || !authForm.email || !authForm.password) {
    showConfirm('Заполните все поля!');
    return;
  }

  if (!agreedToPrivacy) {
    showConfirm('Необходимо согласиться с политикой конфиденциальности!');
    return;
  }

  const { data: existingNickname } = await supabase
    .from('reader_profiles')
    .select('nickname')
    .eq('nickname', authForm.nickname)
    .single();
  
  if (existingNickname) {
    showConfirm('Этот никнейм уже занят!');
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: authForm.email,
    password: authForm.password
  });

  if (error) {
    showConfirm('Ошибка регистрации: ' + error.message);
    return;
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('reader_profiles')
      .insert({
        user_id: data.user.id,
        nickname: authForm.nickname,
        email: authForm.email,
        is_banned: false,
        recent_works: [],
        bookmarks: []
      });

    if (profileError) {
      showConfirm('Ошибка создания профиля: ' + profileError.message);
    } else {
      // НЕ устанавливаем пользователя сразу
showConfirm('Регистрация успешна! Проверьте почту для подтверждения аккаунта.');
setAuthForm({ nickname: '', email: '', password: '' });
setAgreedToPrivacy(false);
setAuthMode('login');
    }
  }
};

const handlePasswordReset = async () => {
  if (!resetEmail) {
    showConfirm('Введите email!');
    return;
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    showConfirm('Проверьте почту! Вам отправили ссылку для восстановления пароля.');
    setShowForgotPassword(false);
    setResetEmail('');
  }
};

const handleLogin = async () => {
  if (!authForm.email || !authForm.password) {
    showConfirm('Введите email и пароль!');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authForm.email,
    password: authForm.password
  });

  if (error) {
    showConfirm('Ошибка входа: ' + error.message);
    return;
  }

  if (data.user) {
    // Проверяем подтверждение email
    if (!data.user.email_confirmed_at) {
      showConfirm('Пожалуйста, подтвердите email. Проверьте почту!');
      await supabase.auth.signOut();
      return;
    }

    setUser(data.user);
    
    const { data: profile } = await supabase
      .from('reader_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profile) {
      if (profile.is_banned) {
        showConfirm('Ваш аккаунт заблокирован!');
        await supabase.auth.signOut();
        return;
      }
      setUserProfile(profile);
    }
    
    setShowAuthModal(false);
    setAuthForm({ nickname: '', email: '', password: '' });
    
    // Перенаправляем на главную страницу
    window.location.href = '/';
  }
};

return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #68d3f3 66%, #a855f7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 8s linear infinite;
        }
      `}</style>

<div className="min-h-screen text-white overflow-x-hidden relative">
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          backgroundImage: 'radial-gradient(ellipse at 20% 0%, #1a0035 0%, #07000f 45%, #000000 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
        
        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
          <div className={`w-full ${isMobile ? 'flex flex-col items-center space-y-6 pt-[24px] pb-12' : 'max-w-6xl grid md:grid-cols-2 gap-12 items-center my-auto'}`}>
            
{!isMobile && (
  <div style={{position:'relative',zIndex:1,paddingLeft:'20px'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes wlShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
      @keyframes wlFadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
      @keyframes wlGlow{0%,100%{text-shadow:0 0 30px rgba(239,1,203,0.4),0 0 60px rgba(147,112,219,0.2);}50%{text-shadow:0 0 50px rgba(239,1,203,0.7),0 0 100px rgba(147,112,219,0.4),0 0 140px rgba(104,211,243,0.2);}}
      @keyframes wlCardPulse{0%,100%{box-shadow:0 0 0 1px rgba(147,112,219,0.2),inset 0 0 30px rgba(147,51,234,0.04);}50%{box-shadow:0 0 0 1px rgba(239,1,203,0.3),inset 0 0 40px rgba(147,51,234,0.08);}}
      @keyframes wlLineFlow{0%{background-position:-200% center;}100%{background-position:200% center;}}
      @keyframes wlOrb1{0%,100%{transform:translate(0,0);opacity:0.5;}50%{transform:translate(-30px,20px);opacity:0.9;}}
      @keyframes wlOrb2{0%,100%{transform:translate(0,0);opacity:0.4;}50%{transform:translate(20px,-25px);opacity:0.7;}}
      @keyframes wlIconPulse{0%,100%{opacity:0.5;transform:scale(1);}50%{opacity:1;transform:scale(1.15);}}
    `}}/>

    {/* Декоративные орбы позади */}
    <div style={{position:'absolute',width:'600px',height:'600px',
      background:'radial-gradient(circle,rgba(147,51,234,0.15) 0%,rgba(109,5,200,0.06) 40%,transparent 70%)',
      filter:'blur(60px)',borderRadius:'50%',
      top:'-150px',left:'-200px',pointerEvents:'none',zIndex:0,
      animation:'wlOrb1 12s ease-in-out infinite'}}/>
    <div style={{position:'absolute',width:'350px',height:'350px',
      background:'radial-gradient(circle,rgba(239,1,203,0.1) 0%,transparent 70%)',
      filter:'blur(50px)',borderRadius:'50%',
      top:'200px',left:'300px',pointerEvents:'none',zIndex:0,
      animation:'wlOrb2 9s ease-in-out infinite'}}/>

    <div style={{position:'relative',zIndex:1}}>

      {/* Статус-пилюля */}
 <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'28px',animation:'wlFadeUp 0.5s ease-out'}}>
  <div style={{
    display:'inline-flex',alignItems:'center',gap:'8px',
    padding:'6px 18px',alignSelf:'flex-start',
    border:'1px solid rgba(239,1,203,0.35)',
    borderRadius:'100px',
    background:'rgba(239,1,203,0.07)',
    backdropFilter:'blur(8px)'
  }}>
    <div style={{width:'6px',height:'6px',borderRadius:'50%',
      background:'#ef01cb',
      boxShadow:'0 0 8px #ef01cb,0 0 20px rgba(239,1,203,0.6)'}}/>
    <span style={{
      fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'4px',
      color:'rgba(239,1,203,0.85)',textTransform:'uppercase'
    }}>Авторская платформа</span>
  </div>

  <div style={{
    display:'inline-flex',alignItems:'center',gap:'8px',
    padding:'6px 18px',alignSelf:'flex-start',
    border:'1px solid rgba(147,112,219,0.3)',
    borderRadius:'100px',
    background:'rgba(147,112,219,0.07)',
    backdropFilter:'blur(8px)'
  }}>
    <div style={{width:'6px',height:'6px',borderRadius:'50%',
      background:'#9370db',
      boxShadow:'0 0 8px #9370db,0 0 20px rgba(147,112,219,0.5)'}}/>
    <span style={{
      fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'4px',
      color:'rgba(192,132,252,0.85)',textTransform:'uppercase'
    }}>Контент 18+</span>
  </div>
</div>

      {/* Главный заголовок */}
      <div style={{marginBottom:'12px',animation:'wlFadeUp 0.6s ease-out 0.1s both'}}>
<h1 style={{
  fontFamily:"'plommir', Georgia, serif",
  fontWeight:'300',
  fontSize:'clamp(5rem,9vw,8.5rem)',
  backgroundImage:'linear-gradient(90deg,#9333ea 0%,#ec4899 25%,#06b6d4 50%,#ec4899 75%,#9333ea 100%)',
  WebkitBackgroundClip:'text',
  WebkitTextFillColor:'transparent',
  backgroundClip:'text',
  lineHeight:0.95,
  margin:'0 0 6px 0',
  letterSpacing:'-2px',
  whiteSpace:'nowrap'
}}>MelloStory</h1>
      </div>

      {/* Подзаголовок */}
      <p style={{
        fontFamily:"'plommir', Georgia, serif",
        fontSize:'clamp(1.1rem,2vw,1.4rem)',
        color:'rgba(219,204,255,0.9)',
        marginBottom:'44px',
        letterSpacing:'2px',
        animation:'wlFadeUp 0.6s ease-out 0.2s both'
      }}>Мир фанфикшна и оригинальных романов</p>

      {/* Горизонтальная линия-разделитель */}
      <div style={{
        display:'flex',alignItems:'center',gap:'16px',marginBottom:'40px',
        animation:'wlFadeUp 0.6s ease-out 0.3s both'
      }}>
        <div style={{height:'1px',width:'60px',
          background:'linear-gradient(90deg,rgba(239,1,203,0.6),rgba(192,132,252,0.3),transparent)',
          backgroundSize:'200% auto',animation:'wlLineFlow 3s linear infinite'}}/>
        <span style={{color:'rgba(192,132,252,0.5)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · · ✦</span>
        <div style={{flex:1,height:'1px',
          background:'linear-gradient(90deg,rgba(192,132,252,0.2),transparent)'}}/>
      </div>

      {/* Карточки преимуществ */}
      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        {[
          {
            icon:'◈',
            color:'#ef01cb',
            glow:'rgba(239,1,203,0.3)',
            title:'Эксклюзивный контент',
            sub:'Авторские материалы о творческом процессе'
          },
          {
            icon:'◈',
            color:'#c084fc',
            glow:'rgba(192,132,252,0.3)',
            title:'Визуальная вселенная',
            sub:'Саундтреки, анкеты персонажей и бонусный контент'
          },
          {
            icon:'◈',
            color:'#68d3f3',
            glow:'rgba(104,211,243,0.3)',
            title:'Живое сообщество',
            sub:'Общение с автором, обсуждения и рецензии читателей'
          },
          {
            icon:'◈',
            color:'#a78bfa',
            glow:'rgba(167,139,250,0.3)',
            title:'Личная коллекция',
            sub:'Сохраняй избранные произведения и арты'
          }
        ].map((item, i) => (
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:'16px',
            padding:'14px 18px',
            background:'rgba(10,0,25,0.55)',
            border:`1px solid rgba(147,112,219,0.18)`,
            borderLeft:`2px solid ${item.color}`,
            borderRadius:'0 8px 8px 0',
            backdropFilter:'blur(12px)',
            animation:`wlFadeUp 0.6s ease-out ${0.35 + i * 0.1}s both`,
            transition:'all 0.25s',
            cursor:'default'
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.background='rgba(20,0,45,0.8)';
            e.currentTarget.style.borderColor=`rgba(147,112,219,0.4)`;
            e.currentTarget.style.transform='translateX(6px)';
            e.currentTarget.style.boxShadow=`0 0 20px ${item.glow}`;
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.background='rgba(10,0,25,0.55)';
            e.currentTarget.style.borderColor='rgba(147,112,219,0.18)';
            e.currentTarget.style.transform='translateX(0)';
            e.currentTarget.style.boxShadow='none';
          }}>
            <span style={{
              fontSize:'1rem',flexShrink:0,
              color:item.color,
              textShadow:`0 0 15px ${item.glow}`,
              animation:'wlIconPulse 2.5s ease-in-out infinite',
              animationDelay:`${i*0.4}s`
            }}>{item.icon}</span>
            <div>
              <p style={{
                fontFamily:'Cinzel,serif',fontSize:'0.72rem',letterSpacing:'2px',
                color:'rgba(225,210,255,0.95)',margin:'0 0 3px 0',textTransform:'uppercase'
              }}>{item.title}</p>
              <p style={{
                fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.82rem',
                color:'rgba(190,175,230,0.65)',margin:0,lineHeight:'1.4'
              }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Нижний декор */}
      <div style={{
        display:'flex',alignItems:'center',gap:'16px',marginTop:'36px',
        animation:'wlFadeUp 0.6s ease-out 0.8s both'
      }}>
        <div style={{height:'1px',width:'40px',
          background:'linear-gradient(90deg,rgba(104,211,243,0.4),transparent)'}}/>
        <span style={{color:'rgba(104,211,243,0.2)',fontSize:'0.45rem',letterSpacing:'10px'}}>· · · · · · · ·</span>
      </div>

    </div>
  </div>
)}

  {isMobile && (
  <div style={{textAlign:'center',width:'100%',maxWidth:'380px',position:'relative',zIndex:1}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes wlShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
    `}}/>

<div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'18px',alignItems:'center'}}>
  <div style={{
    display:'inline-flex',alignItems:'center',gap:'8px',
    padding:'5px 14px',
    border:'1px solid rgba(239,1,203,0.35)',borderRadius:'100px',
    background:'rgba(239,1,203,0.07)'
  }}>
    <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#ef01cb',
      boxShadow:'0 0 8px #ef01cb'}}/>
    <span style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'3px',
      color:'rgba(239,1,203,0.85)'}}>АВТОРСКАЯ ПЛАТФОРМА</span>
  </div>

  <div style={{
    display:'inline-flex',alignItems:'center',gap:'8px',
    padding:'5px 14px',
    border:'1px solid rgba(147,112,219,0.3)',borderRadius:'100px',
    background:'rgba(147,112,219,0.07)'
  }}>
    <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#9370db',
      boxShadow:'0 0 8px #9370db,0 0 20px rgba(147,112,219,0.5)'}}/>
    <span style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'3px',
      color:'rgba(192,132,252,0.85)'}}>КОНТЕНТ 18+</span>
  </div>
</div>

<h1 style={{
  fontFamily:"'plommir', Georgia, serif",
  fontWeight:'300',
  fontSize:'clamp(4rem,16vw,6rem)',
  backgroundImage:'linear-gradient(90deg,#9333ea 0%,#ec4899 25%,#06b6d4 50%,#ec4899 75%,#9333ea 100%)',
  WebkitBackgroundClip:'text',
  WebkitTextFillColor:'transparent',
  backgroundClip:'text',
  lineHeight:1,
  margin:'0 0 12px 0',
  letterSpacing:'-1px'
}}>MelloStory</h1>

    <p style={{
      fontFamily:"'plommir', Georgia, serif",fontSize:'0.95rem',
      color:'rgba(219,204,255,0.85)',marginBottom:'28px',letterSpacing:'1.5px'
    }}>Мир фанфикшна и оригинальных романов</p>

    <div style={{display:'flex',flexDirection:'column',gap:'10px',textAlign:'left'}}>
      {[
        {color:'#ef01cb',title:'Эксклюзивный контент',sub:'Авторские материалы о творческом процессе'},
        {color:'#c084fc',title:'Визуальная вселенная',sub:'Саундтреки, анкеты персонажей, бонусы'},
        {color:'#68d3f3',title:'Живое сообщество',sub:'Общение с автором и обсуждения'},
        {color:'#a78bfa',title:'Личная коллекция',sub:'Сохраняй избранные произведения'}
      ].map((item,i)=>(
        <div key={i} style={{
          display:'flex',alignItems:'center',gap:'12px',
          padding:'11px 14px',
          background:'rgba(10,0,25,0.55)',
          border:'1px solid rgba(147,112,219,0.18)',
          borderLeft:`2px solid ${item.color}`,
          borderRadius:'0 8px 8px 0',
          backdropFilter:'blur(12px)'
        }}>
          <span style={{color:item.color,fontSize:'0.7rem',textShadow:`0 0 10px ${item.color}`}}>◈</span>
          <div>
            <p style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'2px',
              color:'rgba(225,210,255,0.95)',margin:'0 0 2px 0',textTransform:'uppercase'}}>{item.title}</p>
            <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.75rem',
              color:'rgba(190,175,230,0.65)',margin:0}}>{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* ФОРМА */}
<div style={{width:'100%',maxWidth:'380px',margin:'0 auto',position:'relative',zIndex:20}}>
  <style dangerouslySetInnerHTML={{__html:`
    .wl-input:focus{outline:none!important;border-color:rgba(147,51,234,0.8)!important;box-shadow:0 0 0 1px rgba(147,51,234,0.3)!important;background:rgba(3,0,12,0.9)!important;}
    .wl-input::placeholder{color:rgba(147,112,219,0.3);}
  `}}/>

  <div style={{
    background:'rgba(4,0,14,0.95)',
    border:'1px solid rgba(147,112,219,0.25)',
    borderRadius:'14px',
    padding: isMobile ? '24px 20px 28px' : '32px 28px 36px',
    position:'relative',overflow:'hidden',
    boxShadow:'0 0 0 1px rgba(239,1,203,0.1),0 40px 80px rgba(147,51,234,0.3)'
  }}>

    {/* Угловые декоры */}
    <div style={{position:'absolute',top:'12px',left:'12px',width:'14px',height:'14px',
      borderTop:'1px solid rgba(239,1,203,0.45)',borderLeft:'1px solid rgba(239,1,203,0.45)'}}/>
    <div style={{position:'absolute',top:'12px',right:'12px',width:'14px',height:'14px',
      borderTop:'1px solid rgba(239,1,203,0.45)',borderRight:'1px solid rgba(239,1,203,0.45)'}}/>
    <div style={{position:'absolute',bottom:'12px',left:'12px',width:'14px',height:'14px',
      borderBottom:'1px solid rgba(147,112,219,0.3)',borderLeft:'1px solid rgba(147,112,219,0.3)'}}/>
    <div style={{position:'absolute',bottom:'12px',right:'12px',width:'14px',height:'14px',
      borderBottom:'1px solid rgba(147,112,219,0.3)',borderRight:'1px solid rgba(147,112,219,0.3)'}}/>

    {/* Фоновый свет */}
    <div style={{position:'absolute',top:'-60px',left:'50%',transform:'translateX(-50%)',
      width:'200px',height:'140px',pointerEvents:'none',
      background:'radial-gradient(ellipse,rgba(239,1,203,0.06) 0%,transparent 70%)'}}/>

    {/* Заголовок */}
    <div style={{textAlign:'center',marginBottom:'24px',position:'relative',zIndex:1}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
        <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(239,1,203,0.25))'}}/>
        <span style={{color:'rgba(239,1,203,0.35)',fontSize:'0.5rem',letterSpacing:'6px'}}>✦ · · · ✦</span>
        <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(239,1,203,0.25))'}}/>
      </div>

      <h2 style={{
        fontFamily:"'plommir', Georgia, serif",
        fontWeight:'300',fontSize:'2.4rem',
        backgroundImage:'linear-gradient(90deg,#9333ea 0%,#ec4899 25%,#06b6d4 50%,#ec4899 75%,#9333ea 100%)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
        margin:'0 0 10px 0',lineHeight:1
      }}>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>

      <p style={{
        fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.78rem',
        color:'rgba(190,175,230,0.6)',lineHeight:'1.5',
        maxWidth:'260px',margin:'0 auto'
      }}>
        {authMode === 'login'
          ? 'Пожалуйста, введите ваш почтовый ящик, указанный при регистрации, и пароль.'
          : 'Заполните все поля для создания аккаунта'}
      </p>
    </div>

    {/* Поля */}
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'relative',zIndex:1}}>

      {authMode === 'register' && (
        <div style={{position:'relative'}}>
          <div style={{
            position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',
            width:'30px',height:'30px',borderRadius:'6px',
            display:'flex',alignItems:'center',justifyContent:'center',
            background: focusedField==='nickname'||authForm.nickname.length>0 ? 'rgba(239,1,203,0.1)' : 'rgba(147,112,219,0.06)',
            border: focusedField==='nickname'||authForm.nickname.length>0 ? '1px solid rgba(239,1,203,0.5)' : '1px solid rgba(147,112,219,0.2)',
            transition:'all 0.3s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={focusedField==='nickname'||authForm.nickname.length>0?"#ef01cb":"rgba(147,112,219,0.5)"} strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke={focusedField==='nickname'||authForm.nickname.length>0?"#c084fc":"rgba(147,112,219,0.4)"} strokeWidth="1.5"/>
            </svg>
          </div>
          <input type="text" placeholder="Никнейм"
            value={authForm.nickname}
            onChange={e=>setAuthForm({...authForm,nickname:e.target.value})}
            onFocus={()=>setFocusedField('nickname')}
            onBlur={()=>setFocusedField(null)}
            className="wl-input"
            style={{
              width:'100%',boxSizing:'border-box',
              paddingLeft:'50px',paddingRight:'14px',paddingTop:'12px',paddingBottom:'12px',
              background:'rgba(5,0,18,0.7)',border:'1px solid rgba(147,112,219,0.2)',
              borderRadius:'8px',color:'rgba(225,215,255,0.95)',
              fontSize:'0.88rem',fontFamily:'Georgia,serif',transition:'all 0.3s'
            }}/>
        </div>
      )}

      <div style={{position:'relative'}}>
        <div style={{
          position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',
          width:'30px',height:'30px',borderRadius:'6px',
          display:'flex',alignItems:'center',justifyContent:'center',
          background: focusedField==='email'||authForm.email.length>0 ? 'rgba(239,1,203,0.1)' : 'rgba(147,112,219,0.06)',
          border: focusedField==='email'||authForm.email.length>0 ? '1px solid rgba(239,1,203,0.5)' : '1px solid rgba(147,112,219,0.2)',
          transition:'all 0.3s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke={focusedField==='email'||authForm.email.length>0?"#ef01cb":"rgba(147,112,219,0.5)"} strokeWidth="1.5"/>
            <path d="M3 7l9 6 9-6" stroke={focusedField==='email'||authForm.email.length>0?"#c084fc":"rgba(147,112,219,0.4)"} strokeWidth="1.5"/>
          </svg>
        </div>
        <input type="email" placeholder="Email"
          value={authForm.email}
          onChange={e=>setAuthForm({...authForm,email:e.target.value})}
          onFocus={()=>setFocusedField('email')}
          onBlur={()=>setFocusedField(null)}
          className="wl-input"
          style={{
            width:'100%',boxSizing:'border-box',
            paddingLeft:'50px',paddingRight:'14px',paddingTop:'12px',paddingBottom:'12px',
            background:'rgba(5,0,18,0.7)',border:'1px solid rgba(147,112,219,0.2)',
            borderRadius:'8px',color:'rgba(225,215,255,0.95)',
            fontSize:'0.88rem',fontFamily:'Georgia,serif',transition:'all 0.3s'
          }}/>
      </div>

      <div style={{position:'relative'}}>
        <div style={{
          position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',
          width:'30px',height:'30px',borderRadius:'6px',
          display:'flex',alignItems:'center',justifyContent:'center',
          background: focusedField==='password'||authForm.password.length>0 ? 'rgba(239,1,203,0.1)' : 'rgba(147,112,219,0.06)',
          border: focusedField==='password'||authForm.password.length>0 ? '1px solid rgba(239,1,203,0.5)' : '1px solid rgba(147,112,219,0.2)',
          transition:'all 0.3s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke={focusedField==='password'||authForm.password.length>0?"#ef01cb":"rgba(147,112,219,0.5)"} strokeWidth="1.5"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={focusedField==='password'||authForm.password.length>0?"#c084fc":"rgba(147,112,219,0.4)"} strokeWidth="1.5"/>
            <circle cx="12" cy="16" r="1.2" fill={focusedField==='password'||authForm.password.length>0?"#ef01cb":"rgba(147,112,219,0.5)"}/>
          </svg>
        </div>
        <input type="password" placeholder="Пароль"
          value={authForm.password}
          onChange={e=>setAuthForm({...authForm,password:e.target.value})}
          onFocus={()=>setFocusedField('password')}
          onBlur={()=>setFocusedField(null)}
          className="wl-input"
          style={{
            width:'100%',boxSizing:'border-box',
            paddingLeft:'50px',paddingRight:'14px',paddingTop:'12px',paddingBottom:'12px',
            background:'rgba(5,0,18,0.7)',border:'1px solid rgba(147,112,219,0.2)',
            borderRadius:'8px',color:'rgba(225,215,255,0.95)',
            fontSize:'0.88rem',fontFamily:'Georgia,serif',transition:'all 0.3s'
          }}/>
      </div>

      {authMode === 'register' && (
        <div style={{
          display:'flex',alignItems:'flex-start',gap:'10px',
          padding:'11px 13px',
          background:'rgba(5,0,18,0.5)',
          border:'1px solid rgba(147,112,219,0.15)',
          borderRadius:'8px'
        }}>
          <input type="checkbox" id="privacy"
            checked={agreedToPrivacy}
            onChange={e=>setAgreedToPrivacy(e.target.checked)}
            style={{marginTop:'2px',accentColor:'#9333ea',flexShrink:0}}/>
          <label htmlFor="privacy" style={{
            fontFamily:'Georgia,serif',fontStyle:'italic',
            fontSize:'0.75rem',color:'rgba(175,160,220,0.7)',lineHeight:'1.5',cursor:'pointer'
          }}>
            Согласен с{' '}
            <Link href="/privacy" style={{color:'rgba(147,112,219,0.8)',textDecoration:'underline'}}>
              Политикой конфиденциальности
            </Link>
            {' '}и{' '}
            <Link href="/terms" style={{color:'rgba(147,112,219,0.8)',textDecoration:'underline'}}>
              Пользовательским соглашением
            </Link>
          </label>
        </div>
      )}

      {/* Кнопка */}
<button
  onClick={authMode==='login' ? handleLogin : handleRegister}
  style={{
    width:'100%',padding:'13px',marginTop:'2px',
    background:'linear-gradient(160deg,#0d0020 0%,#2d0a5e 45%,#1a0040 100%)',
    border:'1px solid rgba(147,112,219,0.5)',
    borderRadius:'8px',cursor:'pointer',
    fontFamily:'Cinzel,serif',fontSize:'0.72rem',letterSpacing:'3px',
    textTransform:'uppercase',color:'rgba(210,190,255,0.9)',
    boxShadow:'0 0 0 1px rgba(147,112,219,0.15),0 4px 24px rgba(80,20,160,0.4)',
    transition:'all 0.2s'
  }}
  onMouseEnter={e=>{
    e.currentTarget.style.background='linear-gradient(160deg,#1a0035 0%,#4a1580 45%,#2d0a6e 100%)';
    e.currentTarget.style.borderColor='rgba(192,132,252,0.8)';
    e.currentTarget.style.boxShadow='0 0 0 1px rgba(192,132,252,0.3),0 6px 28px rgba(100,40,200,0.55)';
    e.currentTarget.style.color='rgba(230,215,255,1)';
  }}
  onMouseLeave={e=>{
    e.currentTarget.style.background='linear-gradient(160deg,#0d0020 0%,#2d0a5e 45%,#1a0040 100%)';
    e.currentTarget.style.borderColor='rgba(147,112,219,0.5)';
    e.currentTarget.style.boxShadow='0 0 0 1px rgba(147,112,219,0.15),0 4px 24px rgba(80,20,160,0.4)';
    e.currentTarget.style.color='rgba(210,190,255,0.9)';
  }}
>{authMode==='login' ? '✦ Войти ✦' : '✦ Зарегистрироваться ✦'}</button>

      {/* Нижние ссылки */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px',alignItems:'center'}}>
        {authMode==='login' ? (
          <button onClick={()=>setShowForgotPassword(true)}
            style={{
              background:'none',border:'none',cursor:'pointer',
              fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.78rem',
              color:'rgba(147,112,219,0.45)',transition:'color 0.2s'
            }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(219,204,255,0.85)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
            Забыли пароль?
          </button>
        ) : (
          <p style={{
            fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.72rem',
            color:'rgba(147,112,219,0.5)',textAlign:'center',lineHeight:'1.6',
            maxWidth:'290px',margin:0
          }}>
            После заполнения всех полей нажимайте кнопку «Регистрация» только один раз. Повторное нажатие может привести к многократному созданию аккаунта.<br/>
            Для подтверждения регистрации проверьте письмо от Supabase в вашей электронной почте.
          </p>
        )}

        <div style={{display:'flex',alignItems:'center',gap:'12px',width:'100%'}}>
          <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.12)'}}/>
          <button onClick={()=>setAuthMode(authMode==='login'?'register':'login')}
            style={{
              background:'none',border:'none',cursor:'pointer',
              fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.78rem',
              color:'rgba(147,112,219,0.45)',whiteSpace:'nowrap',transition:'color 0.2s'
            }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(219,204,255,0.85)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
            {authMode==='login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
          </button>
          <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.12)'}}/>
        </div>
      </div>

    </div>
  </div>
</div>
          </div>
        </div>

        {/* FOOTER */}
<footer className="py-8 text-center relative z-[5]" style={{
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(10px)',
  position: 'relative'
}}>
  <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
    background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'12px'}}>
    <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.3))'}}/>
    <span style={{color:'rgba(179,231,239,0.25)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
    <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.3))'}}/>
  </div>
  <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.7rem,1.5vw,0.85rem)',letterSpacing:'4px',
    color:'rgba(179,231,239,0.35)',marginBottom:'8px'}}>MelloStory © 2026</p>
  <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.6rem,1.2vw,0.7rem)',
    color:'rgba(147,112,219,0.3)',maxWidth:'500px',margin:'0 auto 16px',lineHeight:'1.8',padding:'0 16px'}}>
    Все права защищены. Копирование без разрешения автора запрещено.
  </p>
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap',padding:'0 16px'}}>
    <Link href="/privacy" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
      letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',textDecoration:'none'}}>
      Политика конфиденциальности
    </Link>
    <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.7rem'}}>✦</span>
    <Link href="/mission" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
      letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',textDecoration:'none'}}>
      Миссия сайта
    </Link>
    <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.7rem'}}>✦</span>
    <Link href="/terms" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
      letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',textDecoration:'none'}}>
      Пользовательское соглашение
    </Link>
  </div>
</footer>

  {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes confirmTwinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
      @keyframes confirmGoldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    `}} />
    <div style={{
      background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 80%)',
      border: '1px solid rgba(180,100,255,0.25)',
      boxShadow: '0 0 60px rgba(147,50,255,0.2)',
      borderRadius: '12px',
      width: '100%', maxWidth: '420px',
      padding: '32px 28px',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center'
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
        background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)' }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 75% 20%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 50% 75%, rgba(255,255,255,0.15) 0%, transparent 100%)`,
        animation:'confirmTwinkle 4s ease-in-out infinite' }}/>

      <div style={{ fontSize:'1.5rem', marginBottom:'8px', color:'rgba(180,100,255,0.5)' }}>✦</div>
      <p style={{ color:'#e8d5ff', fontSize:'1rem', lineHeight:'1.7', marginBottom:'8px',
        fontFamily:'Georgia, serif', fontStyle:'italic', position:'relative', zIndex:1 }}>
        {confirmMessage}
      </p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' }}>
        <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
        <span style={{ color:'rgba(180,100,255,0.3)', fontSize:'0.6rem', letterSpacing:'4px' }}>· · ·</span>
        <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
      </div>

      <div className="flex gap-3" style={{ position:'relative', zIndex:1 }}>
        {confirmAction ? (
          <>
            <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
              flex:1, padding:'10px',
              background:'rgba(147,112,219,0.2)',
              border:'1px solid rgba(147,112,219,0.6)',
              color:'#d8b4fe',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'4px',
              boxShadow:'0 0 15px rgba(147,112,219,0.2)'
            }}>✦ Да</button>
            <button onClick={() => setShowConfirmModal(false)} style={{
              flex:1, padding:'10px',
              background:'transparent',
              border:'1px solid rgba(147,112,219,0.25)',
              color:'rgba(180,100,255,0.5)',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'4px'
            }}>Отмена</button>
          </>
        ) : (
          <button onClick={() => setShowConfirmModal(false)} style={{
            width:'100%', padding:'10px',
            background:'rgba(147,112,219,0.15)',
            border:'1px solid rgba(147,112,219,0.5)',
            color:'#d8b4fe',
            fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
            cursor:'pointer', borderRadius:'4px',
            boxShadow:'0 0 15px rgba(147,112,219,0.2)'
          }}>✦ ОК ✦</button>
        )}
      </div>
    </div>
  </div>
)}
        {/* FORGOT PASSWORD MODAL */}
 {showForgotPassword && (
  <div style={{
    position:'fixed',inset:0,zIndex:100,
    display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',
    background:'rgba(2,0,10,0.92)',backdropFilter:'blur(12px)'
  }}>
    <div style={{width:'100%',maxWidth:'380px',position:'relative'}}>

      {/* Карточка */}
      <div style={{
        background:'rgba(4,0,14,0.95)',
        border:'1px solid rgba(147,112,219,0.25)',
        borderRadius:'14px',
        padding:'32px 28px 36px',
        position:'relative',overflow:'hidden',
        boxShadow:'0 0 0 1px rgba(239,1,203,0.1),0 40px 80px rgba(147,51,234,0.3)'
      }}>

        {/* Угловые декоры */}
        <div style={{position:'absolute',top:'12px',left:'12px',width:'14px',height:'14px',
          borderTop:'1px solid rgba(239,1,203,0.45)',borderLeft:'1px solid rgba(239,1,203,0.45)'}}/>
        <div style={{position:'absolute',top:'12px',right:'12px',width:'14px',height:'14px',
          borderTop:'1px solid rgba(239,1,203,0.45)',borderRight:'1px solid rgba(239,1,203,0.45)'}}/>
        <div style={{position:'absolute',bottom:'12px',left:'12px',width:'14px',height:'14px',
          borderBottom:'1px solid rgba(147,112,219,0.3)',borderLeft:'1px solid rgba(147,112,219,0.3)'}}/>
        <div style={{position:'absolute',bottom:'12px',right:'12px',width:'14px',height:'14px',
          borderBottom:'1px solid rgba(147,112,219,0.3)',borderRight:'1px solid rgba(147,112,219,0.3)'}}/>

        {/* Фоновый свет */}
        <div style={{position:'absolute',top:'-60px',left:'50%',transform:'translateX(-50%)',
          width:'200px',height:'140px',pointerEvents:'none',
          background:'radial-gradient(ellipse,rgba(239,1,203,0.06) 0%,transparent 70%)'}}/>

        {/* Кнопка закрытия */}
        <button onClick={()=>{setShowForgotPassword(false);setResetEmail('');}}
          style={{
            position:'absolute',top:'16px',right:'16px',
            background:'none',border:'none',cursor:'pointer',
            color:'rgba(147,112,219,0.4)',fontSize:'1.1rem',
            lineHeight:1,padding:'4px',
            transition:'color 0.2s'
          }}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(239,1,203,0.8)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.4)'}>✕</button>

        {/* Заголовок */}
        <div style={{textAlign:'center',marginBottom:'24px',position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
            <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(239,1,203,0.25))'}}/>
            <span style={{color:'rgba(239,1,203,0.35)',fontSize:'0.5rem',letterSpacing:'6px'}}>✦ · · · ✦</span>
            <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(239,1,203,0.25))'}}/>
          </div>

<h2 style={{
  fontFamily:"'plommir', Georgia, serif",
  fontWeight:'300',fontSize:'2.4rem',
  background:'linear-gradient(90deg,#9333ea 0%,#ec4899 25%,#06b6d4 50%,#ec4899 75%,#9333ea 100%)',
  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
  margin:'0 0 10px 0',lineHeight:1
}}>Восстановление</h2>

          <p style={{
            fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.78rem',
            color:'rgba(190,175,230,0.6)',lineHeight:'1.5',
            maxWidth:'260px',margin:'0 auto'
          }}>
            Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.
          </p>
        </div>

        {/* Поле email */}
        <div style={{position:'relative',marginBottom:'12px',zIndex:1}}>
          <div style={{
            position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',
            width:'30px',height:'30px',borderRadius:'6px',
            display:'flex',alignItems:'center',justifyContent:'center',
            background: focusedField==='reset-email'||resetEmail.length>0 ? 'rgba(239,1,203,0.1)' : 'rgba(147,112,219,0.06)',
            border: focusedField==='reset-email'||resetEmail.length>0 ? '1px solid rgba(239,1,203,0.5)' : '1px solid rgba(147,112,219,0.2)',
            transition:'all 0.3s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke={focusedField==='reset-email'||resetEmail.length>0?"#ef01cb":"rgba(147,112,219,0.5)"} strokeWidth="1.5"/>
              <path d="M3 7l9 6 9-6" stroke={focusedField==='reset-email'||resetEmail.length>0?"#c084fc":"rgba(147,112,219,0.4)"} strokeWidth="1.5"/>
            </svg>
          </div>
          <input type="email" placeholder="Email"
            value={resetEmail}
            onChange={e=>setResetEmail(e.target.value)}
            onFocus={()=>setFocusedField('reset-email')}
            onBlur={()=>setFocusedField(null)}
            className="wl-input"
            style={{
              width:'100%',boxSizing:'border-box',
              paddingLeft:'50px',paddingRight:'14px',paddingTop:'12px',paddingBottom:'12px',
              background:'rgba(5,0,18,0.7)',border:'1px solid rgba(147,112,219,0.2)',
              borderRadius:'8px',color:'rgba(225,215,255,0.95)',
              fontSize:'0.88rem',fontFamily:'Georgia,serif',transition:'all 0.3s'
            }}/>
        </div>

        {/* Кнопка отправки */}
   <button onClick={handlePasswordReset}
  style={{
    width:'100%',padding:'13px',marginBottom:'10px',
    background:'linear-gradient(160deg,#0d0020 0%,#2d0a5e 45%,#1a0040 100%)',
    border:'1px solid rgba(147,112,219,0.5)',
    borderRadius:'8px',cursor:'pointer',
    fontFamily:'Cinzel,serif',fontSize:'0.72rem',letterSpacing:'3px',
    textTransform:'uppercase',color:'rgba(210,190,255,0.9)',
    boxShadow:'0 0 0 1px rgba(147,112,219,0.15),0 4px 24px rgba(80,20,160,0.4)',
    transition:'all 0.2s'
  }}
  onMouseEnter={e=>{
    e.currentTarget.style.background='linear-gradient(160deg,#1a0035 0%,#4a1580 45%,#2d0a6e 100%)';
    e.currentTarget.style.borderColor='rgba(192,132,252,0.8)';
    e.currentTarget.style.boxShadow='0 0 0 1px rgba(192,132,252,0.3),0 6px 28px rgba(100,40,200,0.55)';
    e.currentTarget.style.color='rgba(230,215,255,1)';
  }}
  onMouseLeave={e=>{
    e.currentTarget.style.background='linear-gradient(160deg,#0d0020 0%,#2d0a5e 45%,#1a0040 100%)';
    e.currentTarget.style.borderColor='rgba(147,112,219,0.5)';
    e.currentTarget.style.boxShadow='0 0 0 1px rgba(147,112,219,0.15),0 4px 24px rgba(80,20,160,0.4)';
    e.currentTarget.style.color='rgba(210,190,255,0.9)';
  }}>
  ✦ Отправить ссылку ✦
</button>

        {/* Отмена */}
        <div style={{textAlign:'center'}}>
          <button onClick={()=>{setShowForgotPassword(false);setResetEmail('');}}
            style={{
              background:'none',border:'none',cursor:'pointer',
              fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.78rem',
              color:'rgba(147,112,219,0.45)',transition:'color 0.2s'
            }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(219,204,255,0.85)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
            Отмена
          </button>
        </div>

      </div>
    </div>
  </div>
)}
      </div>
    </>
  );
}