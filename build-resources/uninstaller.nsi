Section "Uninstall"

; 检测并关闭相关进程
DetailPrint "检测和关闭相关进程..."
Sleep 2000 ;
ExecWait 'taskkill /F /IM "挂载WebDAV.exe"'
Sleep 2000 ;
DetailPrint "完成关闭相关进程"
Sleep 2000 ;

; 删除安装目录及其内容
DetailPrint "开始删除安装目录"
Sleep 2000 ;
Delete "$INSTDIR\*.*"
RMDir /r "$INSTDIR"
Sleep 2000 ;
DetailPrint "完成删除安装目录"
Sleep 2000 ;

; 删除用户配置数据等
DetailPrint "开始删除用户配置数据"
Sleep 2000 ;
Delete "$APPDATA\挂载WebDAV\*.*"
RMDir /r "$APPDATA\挂载WebDAV"
Sleep 2000 ;
DetailPrint "完成删除用户配置数据"
Sleep 2000 ;

SectionEnd
