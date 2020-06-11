# Forgetist

## Let's forget the past

I don't like seeing incomplete tasks which should have done few months ago.  
Forgetist simply deletes overdue tasks from [Todoist](https://todoist.com).  
It only affects to overdue tasks.

If you just leave it, those tasks are not important in your life.  
Then let's forget it and start brand new day!

## Installation

```
$ npm install -g forgetist
```

Add api token in your `.bash_profile`.  
You can check your api token [here](https://todoist.com/prefs/integrations).

```
export TODOIST_API_TOKEN=XXXXXXXXXXXXXXXX
```

## Usage

List overdue tasks.

```
$ forgetist list
```

More detailed.

```
$ forgetist list --all
```

Delete overdue tasks.

```
$ forgetist forget --all
```

You can specify task id.

```
$ forgetist forget 1234
```

Don't worry, there's log option.

```
$ forgetist forget 1234 --log
```

## TODO

- Reschedule(remember)
- Delete due date
- Colored list
- List fogotten list(forgotten)

## Want pressure?

Set up cron job.

```
$ crontab -e
1 0 * * * forgetist forget --all
```
