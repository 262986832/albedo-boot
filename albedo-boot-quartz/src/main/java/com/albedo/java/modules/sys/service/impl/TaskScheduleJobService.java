/**
 * Copyright &copy; 2015 <a href="http://www.bs-innotech.com/">bs-innotech</a> All rights reserved.
 */
package com.albedo.java.modules.sys.service.impl;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.annotation.PostConstruct;

import com.albedo.java.common.security.SecurityUtil;
import org.apache.commons.lang.StringUtils;
import org.quartz.CronScheduleBuilder;
import org.quartz.CronTrigger;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.albedo.java.common.domain.base.BaseEntity;
import com.albedo.java.common.domain.data.SpecificationDetail;
import com.albedo.java.common.repository.service.BaseService;
import com.albedo.java.modules.sys.domain.TaskScheduleJob;
import com.albedo.java.modules.sys.repository.TaskScheduleJobRepository;
import com.albedo.java.modules.sys.service.ITaskScheduleJobService;
import com.albedo.java.util.StringUtil;
import com.albedo.java.util.base.Reflections;
import com.albedo.java.util.config.SystemConfig;
import com.albedo.java.util.domain.Globals;
import com.albedo.java.util.domain.PageModel;
import com.albedo.java.util.exception.RuntimeMsgException;
import com.albedo.java.util.spring.SpringContextHolder;
import com.google.common.collect.Lists;

/**
 * 任务调度管理Service 任务调度
 *
 * @author lj
 * @version 2017-01-23
 */
@ConditionalOnProperty(name = Globals.ALBEDO_QUARTZENABLED)
@Service
@Transactional
public class TaskScheduleJobService extends BaseService<TaskScheduleJob> implements ITaskScheduleJobService {

	@Autowired
	private TaskScheduleJobRepository taskTaskScheduleJobRepository;
	@Autowired
	private Scheduler scheduler;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.albedo.java.modules.sys.service.ITaskScheduleJobService#
	 * afterPropertiesSet()
	 */
	@PostConstruct
	public void init() throws Exception {
		// 这里获取任务信息数据
		List<TaskScheduleJob> jobList = taskTaskScheduleJobRepository
				.findByStatusAndJobStatus(TaskScheduleJob.FLAG_NORMAL, SystemConfig.STR_YES);

		for (TaskScheduleJob job : jobList) {
			try {
				addJob(job);
			} catch (Exception e) {
				log.warn(e.getMessage());
			}
		}
		log.info("init database job over...");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#delete(java.
	 * lang.String)
	 */
	@Override
	public void delete(String ids) {
		Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)).forEach(id -> {
			taskTaskScheduleJobRepository.findOneById(id).map(u -> {
				deleteById(id, SecurityUtil.getCurrentAuditor());
				log.debug("Deleted TaskScheduleJob: {}", u);
				return u;
			}).orElseThrow(() -> new RuntimeMsgException("任务调度 " + id + " 信息为空，删除失败"));
		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#lockOrUnLock(
	 * java.lang.String)
	 */
	@Override
	public void lockOrUnLock(String ids) {
		Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)).forEach(id -> {
			taskTaskScheduleJobRepository.findOneById(id).map(u -> {
				operateStatusById(id,
						BaseEntity.FLAG_NORMAL.equals(u.getStatus()) ? BaseEntity.FLAG_UNABLE : BaseEntity.FLAG_NORMAL, SecurityUtil.getCurrentAuditor());
				log.debug("LockOrUnLock TaskScheduleJob: {}", u);
				return u;
			}).orElseThrow(() -> new RuntimeMsgException("任务调度 " + id + " 信息为空，操作失败"));
		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#findOne(java.
	 * lang.String)
	 */
	@Override
	@Transactional(readOnly = true)
	public TaskScheduleJob findOne(String id) {
		return taskTaskScheduleJobRepository.findOne(id);
	}

	@Transactional(readOnly = true)
	public TaskScheduleJob findOneBySourceId(String soruceId) {
		return taskTaskScheduleJobRepository.findTopBySourceIdAndStatusNot(soruceId, TaskScheduleJob.FLAG_DELETE);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#findAll(com.
	 * albedo.java.common.domain.data.SpecificationDetail,
	 * com.albedo.java.util.domain.PageModel)
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<TaskScheduleJob> findAll(SpecificationDetail<TaskScheduleJob> spec, PageModel<TaskScheduleJob> pm) {
		return taskTaskScheduleJobRepository.findAll(spec, pm);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#getAllTask()
	 */
	@Override
	public List<TaskScheduleJob> getAllTask() {
		return taskTaskScheduleJobRepository.findAll();
	}

	public TaskScheduleJob save(TaskScheduleJob scheduleJob) {
		return save(scheduleJob, true);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#save(com.
	 * albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	public TaskScheduleJob save(TaskScheduleJob scheduleJob, boolean isAddJob) {
		try {
			CronScheduleBuilder.cronSchedule(scheduleJob.getCronExpression());
		} catch (Exception e) {
			throw new RuntimeMsgException("cron表达式有误，不能被解析！");
		}
		Object obj = null;
		try {
			if (StringUtils.isNotBlank(scheduleJob.getSpringId())) {
				obj = SpringContextHolder.getBean(scheduleJob.getSpringId());
			} else {
				Class<?> clazz = Class.forName(scheduleJob.getBeanClass());
				obj = clazz.newInstance();
			}
		} catch (Exception e) {
		}
		if (obj == null) {
			throw new RuntimeMsgException("未找到目标类！");
		}
		Method method = null;
		try {
			method = Reflections.getAccessibleMethodByName(obj, scheduleJob.getMethodName());
		} catch (Exception e) {
			// do nothing.....
		}
		if (method == null) {
			throw new RuntimeMsgException("未找到目标方法！");
		}
		try {
			scheduleJob = taskTaskScheduleJobRepository.save(scheduleJob);
		} catch (Exception e) {
			log.error("msg {}", e.getMessage());
			throw new RuntimeMsgException("保存失败，检查 name group 组合是否有重复！");
		}
		if (isAddJob) {
			if (SystemConfig.STR_NO.equals(scheduleJob.getJobStatus())) {
				deleteJob(scheduleJob);
			} else {
				addJob(scheduleJob);
			}
		}
		return scheduleJob;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#getTaskById(
	 * java.lang.String)
	 */
	@Override
	public TaskScheduleJob getTaskById(String jobId) {
		return taskTaskScheduleJobRepository.findOne(jobId);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#changeStatus(
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public void changeStatus(String jobId, String cmd) {
		TaskScheduleJob job = getTaskById(jobId);
		if (job == null) {
			return;
		}
		if ("stop".equals(cmd)) {
			deleteJob(job);
			job.setJobStatus(SystemConfig.STR_NO);
		} else if ("start".equals(cmd)) {
			job.setJobStatus(SystemConfig.STR_YES);
			addJob(job);
		}
		taskTaskScheduleJobRepository.save(job);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#updateCron(
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public void updateCron(String jobId, String cron) {

		try {
			CronScheduleBuilder.cronSchedule(cron);
		} catch (Exception e) {
			throw new RuntimeMsgException("cron表达式有误，不能被解析！");
		}

		TaskScheduleJob job = getTaskById(jobId);
		if (job == null) {
			return;
		}
		job.setCronExpression(cron);
		if (SystemConfig.YES.equals(job.getJobStatus())) {
			updateJobCron(job);
		}
		taskTaskScheduleJobRepository.save(job);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#addJob(com.
	 * albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void addJob(TaskScheduleJob job) {
		if (job == null || !SystemConfig.STR_YES.equals(job.getJobStatus())) {
			return;
		}

		TriggerKey triggerKey = TriggerKey.triggerKey(job.getName(), job.getGroup());

		CronTrigger trigger = null;
		try {
			trigger = (CronTrigger) scheduler.getTrigger(triggerKey);

			// 不存在，创建一个
			if (null == trigger) {
				Class clazz = SystemConfig.YES.equals(job.getIsConcurrent()) ? QuartzJobFactory.class
						: QuartzJobFactoryDisallowConcurrentExecution.class;

				JobDetail jobDetail = JobBuilder.newJob(clazz).withIdentity(job.getName(), job.getGroup()).build();
				jobDetail.getJobDataMap().put("taskScheduleJob", job);
				CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(job.getCronExpression());
				trigger = TriggerBuilder.newTrigger().withIdentity(job.getName(), job.getGroup())
						.withSchedule(scheduleBuilder).build();
				scheduler.scheduleJob(jobDetail, trigger);

			} else {
				// Trigger已存在，那么更新相应的定时设置
				CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(job.getCronExpression());

				// 按新的cronExpression表达式重新构建trigger
				trigger = trigger.getTriggerBuilder().withIdentity(triggerKey).withSchedule(scheduleBuilder).build();
				// 按新的trigger重新设置job执行
				scheduler.rescheduleJob(triggerKey, trigger);
			}
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#getAllJob()
	 */
	@Override
	public List<TaskScheduleJob> getAllJob() {
		GroupMatcher<JobKey> matcher = GroupMatcher.anyJobGroup();
		Set<JobKey> jobKeys = null;
		try {
			jobKeys = scheduler.getJobKeys(matcher);

			List<TaskScheduleJob> jobList = new ArrayList<TaskScheduleJob>();
			for (JobKey jobKey : jobKeys) {
				List<? extends Trigger> triggers = scheduler.getTriggersOfJob(jobKey);
				for (Trigger trigger : triggers) {
					TaskScheduleJob job = new TaskScheduleJob();
					job.setName(jobKey.getName());
					job.setGroup(jobKey.getGroup());
					job.setDescription("触发器:" + trigger.getKey());
					Trigger.TriggerState triggerState = scheduler.getTriggerState(trigger.getKey());
					job.setJobStatus(triggerState.name());
					if (trigger instanceof CronTrigger) {
						CronTrigger cronTrigger = (CronTrigger) trigger;
						String cronExpression = cronTrigger.getCronExpression();
						job.setCronExpression(cronExpression);
					}
					jobList.add(job);
				}
			}
			return jobList;
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("更新任务失败");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#getRunningJob
	 * ()
	 */
	@Override
	public List<TaskScheduleJob> getRunningJob() {
		List<JobExecutionContext> executingJobs = null;
		try {
			executingJobs = scheduler.getCurrentlyExecutingJobs();
			List<TaskScheduleJob> jobList = new ArrayList<TaskScheduleJob>(executingJobs.size());
			for (JobExecutionContext executingJob : executingJobs) {
				TaskScheduleJob job = new TaskScheduleJob();
				JobDetail jobDetail = executingJob.getJobDetail();
				JobKey jobKey = jobDetail.getKey();
				Trigger trigger = executingJob.getTrigger();
				job.setName(jobKey.getName());
				job.setGroup(jobKey.getGroup());
				job.setDescription("触发器:" + trigger.getKey());
				Trigger.TriggerState triggerState = scheduler.getTriggerState(trigger.getKey());
				job.setJobStatus(triggerState.name());
				if (trigger instanceof CronTrigger) {
					CronTrigger cronTrigger = (CronTrigger) trigger;
					String cronExpression = cronTrigger.getCronExpression();
					job.setCronExpression(cronExpression);
				}
				jobList.add(job);
			}
			return jobList;
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("更新任务失败");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#pauseJob(com.
	 * albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void pauseJob(TaskScheduleJob scheduleJob) {
		JobKey jobKey = JobKey.jobKey(scheduleJob.getName(), scheduleJob.getGroup());
		log.info("pauseJob {}", jobKey);
		try {
			scheduler.pauseJob(jobKey);
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("更新任务失败");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#resumeJob(com
	 * .albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void resumeJob(TaskScheduleJob scheduleJob) {
		JobKey jobKey = JobKey.jobKey(scheduleJob.getName(), scheduleJob.getGroup());
		log.info("resumeJob {}", jobKey);
		try {
			scheduler.resumeJob(jobKey);
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("更新任务失败");
		}
	}

	public void removeBySourceId(String sourceId) {
		List<TaskScheduleJob> itemList = taskTaskScheduleJobRepository.findAllBySourceId(sourceId);
		if (itemList != null)
			for (TaskScheduleJob taskScheduleJob : itemList) {
				deleteJob(taskScheduleJob);
				taskTaskScheduleJobRepository.delete(taskScheduleJob.getId());
			}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#deleteJob(com
	 * .albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void deleteJob(TaskScheduleJob scheduleJob) {
		JobKey jobKey = JobKey.jobKey(scheduleJob.getName(), scheduleJob.getGroup());
		log.info("deleteJob {}", jobKey);
		try {
			scheduler.deleteJob(jobKey);
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("删除任务失败");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#runAJobNow(
	 * com.albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void runAJobNow(TaskScheduleJob scheduleJob) {
		JobKey jobKey = JobKey.jobKey(scheduleJob.getName(), scheduleJob.getGroup());
		log.info("runAJobNow {}", jobKey);
		try {
			scheduler.triggerJob(jobKey);
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.albedo.java.modules.sys.service.ITaskScheduleJobService#updateJobCron
	 * (com.albedo.java.modules.sys.domain.TaskScheduleJob)
	 */
	@Override
	public void updateJobCron(TaskScheduleJob taskScheduleJob) {
		try {
			TriggerKey triggerKey = TriggerKey.triggerKey(taskScheduleJob.getName(), taskScheduleJob.getGroup());

			CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);

			CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(taskScheduleJob.getCronExpression());

			trigger = trigger.getTriggerBuilder().withIdentity(triggerKey).withSchedule(scheduleBuilder).build();
			log.info("updateJobCron {}", triggerKey);
			scheduler.rescheduleJob(triggerKey, trigger);
		} catch (SchedulerException e) {
			log.warn("msg {}", e.getMessage());
			throw new RuntimeMsgException("更新任务失败");
		}
	}

}