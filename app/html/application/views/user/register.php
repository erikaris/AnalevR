<html lang="en"><head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>AnalevR <?php echo isset($title) ? '- ' . $title : '' ?></title>

    <!-- ================= Favicon ================== -->
    <link rel="shortcut icon" href="<?php echo assets_url(); ?>/favicon.ico">
    <link rel="apple-touch-icon" sizes="144x144" href="<?php echo assets_url(); ?>/favicon.ico">
    <link rel="apple-touch-icon" sizes="114x114" href="<?php echo assets_url(); ?>/favicon.ico">
    <link rel="apple-touch-icon" sizes="72x72" href="<?php echo assets_url(); ?>/favicon.ico">
    <link rel="apple-touch-icon" sizes="57x57" href="<?php echo assets_url(); ?>/favicon.ico">

    <script src="<?php echo assets_url() ?>/application/bundle/bundle.js"></script>
</head>

<body class="bg-primary">

    <div class="unix-login">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-lg-offset-3">
                    <div class="login-content">
                        <div class="login-logo">
                            <a href="index.html">
                            	<img src="<?php echo assets_url(); ?>/logo.png">
                            </a>
                        </div>
                        <div class="login-form">
                            <h4>Register</h4>

                            <?php if (isset($message)) { ?>
                                <div class="alert alert-<?php echo $message->type ?>">
                                    <?php echo $message->message ?>
                                </div>
                            <?php } ?>

                            <form method="POST" action="<?php echo base_url() . 'user/cregister' ?>">
                                <div class="form-group">
                                    <label>Email address</label>
                                    <input name="email" type="email" class="form-control" placeholder="Email" value="">
                                </div>
                                <div class="form-group">
                                    <label>Password</label>
                                    <input name="password" type="password" class="form-control" placeholder="Password">
                                </div>
                                <div class="form-group">
                                    <label>Firstname</label>
                                    <input name="firstname" type="text" class="form-control" placeholder="Firstname" value="">
                                </div>
                                <div class="form-group">
                                    <label>Lastname</label>
                                    <input name="lastname" type="text" class="form-control" placeholder="Lastname" value="">
                                </div>
                                <button type="submit" class="btn btn-primary btn-flat m-b-30 m-t-30">Register</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>



</body></html>