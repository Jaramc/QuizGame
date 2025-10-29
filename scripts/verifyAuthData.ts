/**
 * Script para verificar datos guardados en Firebase Auth
 * Ejecutar: npx ts-node scripts/verifyAuthData.ts
 */

import { auth } from '../config/firebase';

async function verifyAuthData() {
  console.log('\n🔍 VERIFICANDO DATOS EN FIREBASE AUTH\n');
  console.log('='.repeat(60));

  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.log('❌ No hay usuario autenticado');
    console.log('➡️  Inicia sesión en la app primero');
    return;
  }

  console.log('\n✅ USUARIO AUTENTICADO:');
  console.log('='.repeat(60));
  console.log('📧 Email:', currentUser.email);
  console.log('🆔 UID:', currentUser.uid);
  console.log('👤 Display Name:', currentUser.displayName || '(no configurado)');
  console.log('📸 Photo URL:', currentUser.photoURL || '(no configurado)');
  console.log('📅 Creado:', currentUser.metadata.creationTime);
  console.log('🔐 Email Verificado:', currentUser.emailVerified);
  console.log('🔑 Provider:', currentUser.providerData[0]?.providerId || 'N/A');
  console.log('='.repeat(60));

  console.log('\n📋 OBJETO COMPLETO:');
  console.log(JSON.stringify({
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    emailVerified: currentUser.emailVerified,
    metadata: currentUser.metadata,
    providerData: currentUser.providerData
  }, null, 2));

  console.log('\n✅ CONCLUSIÓN:');
  if (currentUser.displayName) {
    console.log(`✅ El username "${currentUser.displayName}" SÍ está guardado en Firebase Auth`);
  } else {
    console.log('⚠️  No hay displayName configurado para este usuario');
  }
  console.log('='.repeat(60));
}

// Ejecutar verificación
verifyAuthData()
  .then(() => {
    console.log('\n✅ Verificación completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
