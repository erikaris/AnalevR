import smtplib

email = "soedomoto@gmail.com"
msg = '''\
From: Analev-R <user.analev.r@gmail.com>
Subject: Activation Link

Thank you for registering AnalevR. Please activate your account by follow this link
http://localhost:8080/activate/id/{}'''.format('XXX')

server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
server.ehlo()
# server.starttls()
server.login('user.analev.r', 'python.r')
server.sendmail('user.analev.r@gmail.com', email, msg)
server.quit()
server.close()