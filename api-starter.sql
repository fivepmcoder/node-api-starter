/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3-SQLPub-0.0.1)
 Source Host           : localhost:3306
 Source Schema         : api-starter

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3-SQLPub-0.0.1)
 File Encoding         : 65001

 Date: 19/01/2026 21:57:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `config_id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置id',
  `config_type` char(1) NOT NULL DEFAULT '1' COMMENT '配置类型：1-系统配置；2-业务配置',
  `config_name` varchar(50) NOT NULL COMMENT '配置名称',
  `config_key` varchar(50) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `value_type` char(1) NOT NULL DEFAULT '1' COMMENT '值类型：1-普通文本；2-富文本；3-url',
  `locked` char(1) NOT NULL DEFAULT '0' COMMENT '是否锁定：0-否；1-是',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='配置';

-- ----------------------------
-- Records of sys_config
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_item
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_item`;
CREATE TABLE `sys_dict_item` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典项id',
  `type_code` varchar(50) NOT NULL COMMENT '字典类型编码',
  `item_label` varchar(100) NOT NULL COMMENT '字典项标签',
  `item_value` varchar(200) NOT NULL COMMENT '字典项值',
  `item_desc` varchar(500) DEFAULT NULL COMMENT '字典项描述',
  `locked` char(1) NOT NULL DEFAULT '0' COMMENT '是否锁定：0-否；1-是',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='字典项';

-- ----------------------------
-- Records of sys_dict_item
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `type_id` bigint NOT NULL AUTO_INCREMENT COMMENT '类型id',
  `type_name` varchar(50) NOT NULL COMMENT '类型名称',
  `type_code` varchar(50) NOT NULL COMMENT '类型编码',
  `locked` char(1) NOT NULL DEFAULT '0' COMMENT '是否锁定：0-否；1-是',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='字典类型';

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_log`;
CREATE TABLE `sys_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志id',
  `log_type` varchar(10) DEFAULT NULL COMMENT '日志类型：login-登陆；create-新增；update-更新；delete-删除',
  `log_title` varchar(50) DEFAULT NULL COMMENT '日志标题',
  `request_method` varchar(10) DEFAULT NULL COMMENT '请求方式：get；post；put；delete',
  `method_name` varchar(100) DEFAULT NULL COMMENT '方法名称',
  `api_url` varchar(100) DEFAULT NULL COMMENT '请求路径',
  `request_data` text COMMENT '请求数据',
  `response_data` text COMMENT '响应数据',
  `user_name` varchar(50) DEFAULT NULL COMMENT '操作人',
  `ip` varchar(50) DEFAULT NULL COMMENT '操作ip',
  `ip_localtion` varchar(100) DEFAULT NULL COMMENT 'ip归属地',
  `browser` varchar(100) DEFAULT NULL COMMENT '浏览器',
  `status` char(1) NOT NULL DEFAULT '0' COMMENT '状态：0-失败；1-成功',
  `message` varchar(500) DEFAULT NULL COMMENT '消息',
  `take_time` int NOT NULL DEFAULT '0' COMMENT '执行耗时（毫秒）',
  `request_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '请求时间',
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='日志';

-- ----------------------------
-- Records of sys_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `menu_id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单id',
  `parent_id` bigint NOT NULL COMMENT '父级id',
  `menu_type` char(1) NOT NULL COMMENT '菜单类型：C-目录；M-菜单；B-按钮',
  `menu_name` varchar(50) NOT NULL COMMENT '菜单名称',
  `name` varchar(50) DEFAULT NULL COMMENT '组件名称',
  `path` varchar(100) DEFAULT NULL COMMENT '路由地址',
  `component` varchar(100) DEFAULT NULL COMMENT '组件路径',
  `permission` varchar(50) DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标',
  `link` varchar(100) DEFAULT NULL COMMENT '外部链接',
  `badge` varchar(50) DEFAULT NULL COMMENT '文本徽章',
  `active_path` varchar(100) DEFAULT NULL COMMENT '激活路径',
  `cache` char(1) NOT NULL DEFAULT '0' COMMENT '页面缓存：0-否；1-是',
  `hide_menu` char(1) NOT NULL DEFAULT '0' COMMENT '隐藏菜单：0-否；1-是',
  `iframe` char(1) NOT NULL DEFAULT '0' COMMENT '是否内嵌：0-否；1-是',
  `fixed_tag` char(1) NOT NULL DEFAULT '0' COMMENT '固定标签：0-否；1-是',
  `hide_tag` char(1) NOT NULL DEFAULT '0' COMMENT '隐藏标签：0-否；1-是',
  `full_page` char(1) NOT NULL DEFAULT '0' COMMENT '全屏页面：0-否；1-是',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单';

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_menu_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu_permission`;
CREATE TABLE `sys_menu_permission` (
  `menu_id` bigint NOT NULL COMMENT '菜单id',
  `permission_id` bigint NOT NULL COMMENT '权限id',
  PRIMARY KEY (`menu_id`,`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='预留-菜单权限关系';

-- ----------------------------
-- Records of sys_menu_permission
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `permission_id` bigint NOT NULL AUTO_INCREMENT COMMENT '权限id',
  `permission_name` varchar(50) NOT NULL COMMENT '权限名称',
  `permission_code` varchar(50) NOT NULL COMMENT '权限编码',
  `permission_desc` varchar(100) DEFAULT NULL COMMENT '权限描述',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='预留-权限';

-- ----------------------------
-- Records of sys_permission
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_code` varchar(50) NOT NULL COMMENT '角色编码',
  `role_desc` varchar(100) DEFAULT NULL COMMENT '角色描述',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序，升序',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色';

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` bigint NOT NULL COMMENT '角色id',
  `menu_id` bigint NOT NULL COMMENT '菜单id',
  PRIMARY KEY (`role_id`,`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色菜单关系';

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用；1-正常',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(200) NOT NULL COMMENT '密码',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '昵称',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(100) DEFAULT NULL COMMENT '头像',
  `gender` char(1) NOT NULL DEFAULT '0' COMMENT '性别：0-未知；1-男；2-女',
  `login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录ip',
  `login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`user_id`, `user_name`, `password`, `nick_name`, `phone`, `avatar`, `gender`, `login_ip`, `login_time`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `delete_time`) VALUES (1, 'admin', '$2b$10$sZsrbQ.reDlCqlnlTAXbVuAu/VHO6h3QJE0oSTBCi7YyIbXCkTJxi', 'admin', '13000000000', NULL, '0', NULL, NULL, '1', 'admin', '2026-01-19 21:56:20', 'admin', '2026-01-19 21:56:23', NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` bigint NOT NULL COMMENT '用户id',
  `role_id` bigint NOT NULL COMMENT '角色id',
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户角色关系';

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
